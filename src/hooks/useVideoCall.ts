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
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-request' | 'call-accept' | 'call-reject' | 'call-end';
  from: string;
  fromName?: string;
  to: string;
  data?: any;
  callType?: 'video' | 'audio';
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export const useVideoCall = () => {
  const { user } = useAuth();
  const [callState, setCallState] = useState<CallState>({
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
  });

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Initialize signaling channel
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`calls:${user.id}`, {
      config: { broadcast: { self: false } }
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
            endCall();
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
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const sendSignalingMessage = async (message: Omit<SignalingMessage, 'from'>) => {
    if (!user || !channelRef.current) return;

    const fullMessage: SignalingMessage = {
      ...message,
      from: user.id,
    };

    // Send to the remote user's channel
    const remoteChannel = supabase.channel(`calls:${message.to}`);
    await remoteChannel.send({
      type: 'broadcast',
      event: 'signaling',
      payload: fullMessage,
    });
  };

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (event) => {
      if (event.candidate && callState.remoteUserId) {
        sendSignalingMessage({
          type: 'ice-candidate',
          to: callState.remoteUserId,
          data: event.candidate,
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
        setCallState(prev => ({ 
          ...prev, 
          isConnected: true, 
          isCalling: false, 
          isReceiving: false,
          callStartTime: Date.now() 
        }));
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        endCall();
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [callState.remoteUserId]);

  const getLocalStream = async (isVideo: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error getting local stream:', error);
      throw error;
    }
  };

  const initiateCall = async (remoteUserId: string, remoteUserName: string, callType: 'video' | 'audio') => {
    if (!user) return;

    console.log('Initiating call to:', remoteUserId, callType);

    setCallState({
      isActive: true,
      isCalling: true,
      isReceiving: false,
      isConnected: false,
      isVideoEnabled: callType === 'video',
      isAudioEnabled: true,
      isScreenSharing: false,
      callType,
      remoteUserId,
      remoteUserName,
      callStartTime: null,
    });

    // Get user's display name
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single();

    await sendSignalingMessage({
      type: 'call-request',
      to: remoteUserId,
      fromName: profile?.display_name || 'Người dùng',
      callType,
    });
  };

  const handleIncomingCall = (message: SignalingMessage) => {
    console.log('Incoming call from:', message.from);
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
    if (!callState.remoteUserId) return;

    console.log('Accepting call');

    try {
      const stream = await getLocalStream(callState.callType === 'video');
      const pc = createPeerConnection();

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      await sendSignalingMessage({
        type: 'call-accept',
        to: callState.remoteUserId,
      });

      setCallState(prev => ({ ...prev, isReceiving: false }));
    } catch (error) {
      console.error('Error accepting call:', error);
      endCall();
    }
  };

  const handleCallAccepted = async (message: SignalingMessage) => {
    console.log('Call accepted, creating offer');

    try {
      const stream = await getLocalStream(callState.callType === 'video');
      const pc = createPeerConnection();

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      await sendSignalingMessage({
        type: 'offer',
        to: message.from,
        data: offer,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      endCall();
    }
  };

  const handleCallRejected = () => {
    console.log('Call rejected');
    endCall();
  };

  const rejectCall = async () => {
    if (!callState.remoteUserId) return;

    await sendSignalingMessage({
      type: 'call-reject',
      to: callState.remoteUserId,
    });

    endCall();
  };

  const handleOffer = async (message: SignalingMessage) => {
    console.log('Received offer');
    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
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

  const endCall = async () => {
    console.log('Ending call');

    if (callState.remoteUserId && callState.isActive) {
      await sendSignalingMessage({
        type: 'call-end',
        to: callState.remoteUserId,
      });
    }

    // Stop all tracks
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    remoteStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current?.getTracks().forEach(track => track.stop());

    // Close peer connection
    peerConnectionRef.current?.close();

    // Reset state
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    screenStreamRef.current = null;
    peerConnectionRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);

    setCallState({
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
    });
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState(prev => ({ ...prev, isVideoEnabled: videoTrack.enabled }));
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState(prev => ({ ...prev, isAudioEnabled: audioTrack.enabled }));
      }
    }
  };

  const toggleScreenShare = async () => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
      if (callState.isScreenSharing) {
        // Stop screen sharing, restore camera
        screenStreamRef.current?.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;

        if (callState.callType === 'video') {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          const videoTrack = stream.getVideoTracks()[0];
          
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
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

        setCallState(prev => ({ ...prev, isScreenSharing: false }));
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: false 
        });
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];
        
        // Replace video track with screen track
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
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
          toggleScreenShare();
        };

        setCallState(prev => ({ ...prev, isScreenSharing: true }));
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
