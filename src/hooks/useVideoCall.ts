import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface CallState {
  isActive: boolean;
  isCalling: boolean;
  isReceiving: boolean;
  isConnected: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  callType: 'video' | 'audio' | null;
  remoteUserId: string | null;
  remoteUserName: string | null;
  callStartTime: number | null;
}

interface SignalingMessage {
  type:
    | 'offer'
    | 'answer'
    | 'ice-candidate'
    | 'call-request'
    | 'call-accept'
    | 'call-reject'
    | 'call-end';
  from: string;
  fromName?: string;
  to: string;
  data?: any;
  callType?: 'video' | 'audio';
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

const DEFAULT_CALL_STATE: CallState = {
  isActive: false,
  isCalling: false,
  isReceiving: false,
  isConnected: false,
  isVideoEnabled: true,
  isAudioEnabled: true,
  isScreenSharing: false,
  callType: null,
  remoteUserId: null,
  remoteUserName: null,
  callStartTime: null,
};

type EndCallOptions = {
  notifyRemote?: boolean;
};

export const useVideoCall = () => {
  const { user } = useAuth();
  const [callState, setCallState] = useState<CallState>(DEFAULT_CALL_STATE);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Inbound signaling channel (listens on the current user's channel)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Outbound channel (subscribed once per remote user for the duration of a call)
  const outboundChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const outboundToRef = useRef<string | null>(null);

  const remoteUserIdRef = useRef<string | null>(null);

  // Desired media states (so toggles work even before getUserMedia resolves)
  const desiredAudioEnabledRef = useRef(true);
  const desiredVideoEnabledRef = useRef(true);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const subscribeToChannel = useCallback(
    (channel: ReturnType<typeof supabase.channel>, timeoutMs = 8000) => {
      return new Promise<void>((resolve, reject) => {
        let settled = false;

        const timeout = setTimeout(() => {
          if (settled) return;
          settled = true;
          reject(new Error('Channel subscription timeout'));
        }, timeoutMs);

        channel.subscribe((status) => {
          if (settled) return;

          if (status === 'SUBSCRIBED') {
            settled = true;
            clearTimeout(timeout);
            resolve();
            return;
          }

          if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
            settled = true;
            clearTimeout(timeout);
            reject(new Error(`Channel subscribe failed: ${status}`));
          }
        });
      });
    },
    []
  );

  const ensureOutboundChannel = useCallback(
    async (toUserId: string) => {
      if (!user) throw new Error('Not authenticated');

      if (outboundChannelRef.current && outboundToRef.current === toUserId) {
        return outboundChannelRef.current;
      }

      if (outboundChannelRef.current) {
        supabase.removeChannel(outboundChannelRef.current);
        outboundChannelRef.current = null;
        outboundToRef.current = null;
      }

      const ch = supabase.channel(`calls:${toUserId}`, {
        config: { broadcast: { self: false } },
      });

      await subscribeToChannel(ch);

      outboundChannelRef.current = ch;
      outboundToRef.current = toUserId;
      return ch;
    },
    [subscribeToChannel, user]
  );

  const sendSignalingMessage = useCallback(
    async (message: Omit<SignalingMessage, 'from'>) => {
      if (!user) return;

      const fullMessage: SignalingMessage = {
        ...message,
        from: user.id,
      };

      try {
        const outbound = await ensureOutboundChannel(message.to);
        const res = await outbound.send({
          type: 'broadcast',
          event: 'signaling',
          payload: fullMessage,
        });

        // Some runtime versions return { error }, some return an 'ok' status; guard both.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const maybeError = (res as any)?.error;
        if (maybeError) throw maybeError;

        console.log('Sent signaling message:', message.type, 'to:', message.to);
      } catch (error) {
        console.error('Error sending signaling message:', message.type, error);
        throw error;
      }
    },
    [ensureOutboundChannel, user]
  );

  const endCall = useCallback(
    async (options: EndCallOptions = {}) => {
      const { notifyRemote = true } = options;
      console.log('Ending call');

      const remoteUserId = remoteUserIdRef.current;

      if (notifyRemote && remoteUserId && callState.isActive) {
        try {
          await sendSignalingMessage({
            type: 'call-end',
            to: remoteUserId,
          });
        } catch {
          // Ignore signaling failures while ending (we still want to clean up local state).
        }
      }

      // Stop all tracks
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());

      // Close peer connection
      peerConnectionRef.current?.close();

      // Reset refs/state
      localStreamRef.current = null;
      remoteStreamRef.current = null;
      screenStreamRef.current = null;
      peerConnectionRef.current = null;

      setLocalStream(null);
      setRemoteStream(null);

      remoteUserIdRef.current = null;
      desiredAudioEnabledRef.current = true;
      desiredVideoEnabledRef.current = true;

      if (outboundChannelRef.current) {
        supabase.removeChannel(outboundChannelRef.current);
        outboundChannelRef.current = null;
        outboundToRef.current = null;
      }

      setCallState(DEFAULT_CALL_STATE);
    },
    [callState.isActive, sendSignalingMessage]
  );

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (event) => {
      const to = remoteUserIdRef.current;
      if (event.candidate && to) {
        void sendSignalingMessage({
          type: 'ice-candidate',
          to,
          data: event.candidate,
        }).catch(() => {
          // Ignore per-candidate send errors; connection might still succeed.
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track');
      remoteStreamRef.current = event.streams[0];
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallState((prev) => ({
          ...prev,
          isConnected: true,
          isCalling: false,
          isReceiving: false,
          callStartTime: Date.now(),
        }));
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        void endCall({ notifyRemote: true });
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [endCall, sendSignalingMessage]);

  const getLocalStream = useCallback(async (withVideo: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: withVideo,
        audio: true,
      });

      // Apply desired track states
      stream.getAudioTracks().forEach((t) => {
        t.enabled = desiredAudioEnabledRef.current;
      });
      stream.getVideoTracks().forEach((t) => {
        t.enabled = desiredVideoEnabledRef.current;
      });

      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error getting local stream:', error);
      throw error;
    }
  }, []);

  // Initialize inbound signaling channel
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`calls:${user.id}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'signaling' }, async ({ payload }) => {
        const message = payload as SignalingMessage;
        if (message.to !== user.id) return;

        console.log('Received signaling message:', message.type);

        switch (message.type) {
          case 'call-request':
            handleIncomingCall(message);
            break;
          case 'call-accept':
            await handleCallAccepted(message);
            break;
          case 'call-reject':
            handleCallRejected();
            break;
          case 'call-end':
            await endCall({ notifyRemote: false });
            break;
          case 'offer':
            await handleOffer(message);
            break;
          case 'answer':
            await handleAnswer(message);
            break;
          case 'ice-candidate':
            await handleIceCandidate(message);
            break;
        }
      })
      .subscribe((status) => {
        console.log('Signaling channel status:', status);
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, endCall]);

  const initiateCall = async (toUserId: string, remoteUserName: string, callType: 'video' | 'audio') => {
    if (!user) return;

    console.log('Initiating call to:', toUserId, callType);

    remoteUserIdRef.current = toUserId;
    desiredVideoEnabledRef.current = callType === 'video';
    desiredAudioEnabledRef.current = true;

    setCallState({
      isActive: true,
      isCalling: true,
      isReceiving: false,
      isConnected: false,
      isVideoEnabled: callType === 'video',
      isAudioEnabled: true,
      isScreenSharing: false,
      callType,
      remoteUserId: toUserId,
      remoteUserName,
      callStartTime: null,
    });

    try {
      // Start local preview immediately so mute/video toggles work while dialing
      const stream = await getLocalStream(callType === 'video');
      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Get user's display name
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      await sendSignalingMessage({
        type: 'call-request',
        to: toUserId,
        fromName: profile?.display_name || 'Người dùng',
        callType,
      });
    } catch (error) {
      console.error('Error initiating call:', error);
      await endCall({ notifyRemote: false });
    }
  };

  const handleIncomingCall = (message: SignalingMessage) => {
    console.log('Incoming call from:', message.from);

    remoteUserIdRef.current = message.from;
    desiredVideoEnabledRef.current = message.callType === 'video';
    desiredAudioEnabledRef.current = true;

    setCallState({
      isActive: true,
      isCalling: false,
      isReceiving: true,
      isConnected: false,
      isVideoEnabled: message.callType === 'video',
      isAudioEnabled: true,
      isScreenSharing: false,
      callType: message.callType || 'audio',
      remoteUserId: message.from,
      remoteUserName: message.fromName || null,
      callStartTime: null,
    });
  };

  const acceptCall = async () => {
    const toUserId = callState.remoteUserId;
    if (!toUserId) return;

    console.log('Accepting call');

    try {
      setCallState((prev) => ({ ...prev, isReceiving: false }));

      remoteUserIdRef.current = toUserId;

      const stream = await getLocalStream(callState.callType === 'video');
      const pc = createPeerConnection();

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      await sendSignalingMessage({
        type: 'call-accept',
        to: toUserId,
      });
    } catch (error) {
      console.error('Error accepting call:', error);
      await endCall({ notifyRemote: true });
    }
  };

  const handleCallAccepted = async (message: SignalingMessage) => {
    console.log('Call accepted, creating offer');

    try {
      const toUserId = message.from;
      remoteUserIdRef.current = toUserId;

      const stream = localStreamRef.current ?? (await getLocalStream(callState.callType === 'video'));
      const pc = peerConnectionRef.current ?? createPeerConnection();

      // Ensure tracks are attached (safe to call once per call; browsers ignore duplicates per sender)
      if (pc.getSenders().length === 0) {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await sendSignalingMessage({
        type: 'offer',
        to: toUserId,
        data: offer,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      await endCall({ notifyRemote: true });
    }
  };

  const handleCallRejected = () => {
    console.log('Call rejected');
    void endCall({ notifyRemote: false });
  };

  const rejectCall = async () => {
    const toUserId = callState.remoteUserId;
    if (!toUserId) return;

    try {
      await sendSignalingMessage({
        type: 'call-reject',
        to: toUserId,
      });
    } finally {
      await endCall({ notifyRemote: false });
    }
  };

  const handleOffer = async (message: SignalingMessage) => {
    console.log('Received offer');

    try {
      remoteUserIdRef.current = message.from;

      const pc = peerConnectionRef.current ?? createPeerConnection();
      const stream = localStreamRef.current ?? (await getLocalStream(callState.callType === 'video'));

      if (pc.getSenders().length === 0) {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      }

      await pc.setRemoteDescription(new RTCSessionDescription(message.data));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await sendSignalingMessage({
        type: 'answer',
        to: message.from,
        data: answer,
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (message: SignalingMessage) => {
    console.log('Received answer');
    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(message.data));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (message: SignalingMessage) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
      await pc.addIceCandidate(new RTCIceCandidate(message.data));
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  const toggleVideo = () => {
    desiredVideoEnabledRef.current = !desiredVideoEnabledRef.current;

    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = desiredVideoEnabledRef.current;
      }
    }

    setCallState((prev) => ({ ...prev, isVideoEnabled: desiredVideoEnabledRef.current }));
  };

  const toggleAudio = () => {
    desiredAudioEnabledRef.current = !desiredAudioEnabledRef.current;

    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = desiredAudioEnabledRef.current;
      }
    }

    setCallState((prev) => ({ ...prev, isAudioEnabled: desiredAudioEnabledRef.current }));
  };

  const toggleScreenShare = async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
      if (callState.isScreenSharing) {
        // Stop screen sharing, restore camera
        screenStreamRef.current?.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;

        if (callState.callType === 'video') {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          const videoTrack = stream.getVideoTracks()[0];

          const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack);
          }

          // Update local stream
          if (localStreamRef.current) {
            const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
            if (oldVideoTrack) {
              localStreamRef.current.removeTrack(oldVideoTrack);
            }
            localStreamRef.current.addTrack(videoTrack);
            setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
          }
        }

        setCallState((prev) => ({ ...prev, isScreenSharing: false }));
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace video track with screen track
        const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(screenTrack);
        }

        // Update local stream for preview
        if (localStreamRef.current) {
          const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
          if (oldVideoTrack) {
            localStreamRef.current.removeTrack(oldVideoTrack);
            oldVideoTrack.stop();
          }
          localStreamRef.current.addTrack(screenTrack);
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        }

        // Handle when user stops sharing via browser UI
        screenTrack.onended = () => {
          void toggleScreenShare();
        };

        setCallState((prev) => ({ ...prev, isScreenSharing: true }));
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  return {
    callState,
    localStream,
    remoteStream,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
  };
};

