import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, PhoneOff, Video, VideoOff, Mic, MicOff,
  X, User, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface VideoCallModalProps {
  isOpen: boolean;
  callState: {
    isActive: boolean;
    isCalling: boolean;
    isReceiving: boolean;
    isConnected: boolean;
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    callType: 'video' | 'audio' | null;
    remoteUserId: string | null;
    remoteUserName: string | null;
  };
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
}

const VideoCallModal = ({
  isOpen,
  callState,
  localStream,
  remoteStream,
  onAccept,
  onReject,
  onEnd,
  onToggleVideo,
  onToggleAudio,
}: VideoCallModalProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl h-[80vh] bg-gradient-to-b from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Main Video Area */}
          <div className="relative w-full h-full">
            {/* Remote Video / Avatar */}
            {callState.isConnected && remoteStream ? (
              callState.callType === 'video' ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-rose-900/50 to-purple-900/50">
                  <div className="text-center">
                    <Avatar className="w-32 h-32 mx-auto mb-4 ring-4 ring-rose-400/50">
                      <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white text-4xl">
                        {getInitials(callState.remoteUserName)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-white text-xl font-semibold">{callState.remoteUserName}</p>
                    <p className="text-green-400 text-sm mt-1">Đang trong cuộc gọi...</p>
                  </div>
                </div>
              )
            ) : (
              /* Calling / Receiving State */
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-rose-900/50 to-purple-900/50">
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Avatar className="w-32 h-32 mx-auto mb-6 ring-4 ring-rose-400/50">
                      <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white text-4xl">
                        {getInitials(callState.remoteUserName)}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <p className="text-white text-2xl font-semibold mb-2">
                    {callState.remoteUserName || 'Người dùng'}
                  </p>
                  <p className="text-rose-300">
                    {callState.isCalling && 'Đang gọi...'}
                    {callState.isReceiving && (
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        Cuộc gọi {callState.callType === 'video' ? 'video' : 'thoại'} đến
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </span>
                    )}
                  </p>

                  {/* Receiving Call Actions */}
                  {callState.isReceiving && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-6 mt-8"
                    >
                      <Button
                        onClick={onReject}
                        variant="destructive"
                        size="lg"
                        className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
                      >
                        <PhoneOff className="w-6 h-6" />
                      </Button>
                      <Button
                        onClick={onAccept}
                        size="lg"
                        className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
                      >
                        <Phone className="w-6 h-6" />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Local Video (Picture-in-Picture) */}
            {localStream && callState.callType === 'video' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-24 right-4 w-40 h-28 rounded-xl overflow-hidden shadow-lg ring-2 ring-white/20"
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover mirror"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {!callState.isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <VideoOff className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </motion.div>
            )}

            {/* Call Controls */}
            {(callState.isConnected || callState.isCalling) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 rounded-full bg-black/50 backdrop-blur-lg"
              >
                {/* Toggle Audio */}
                <Button
                  onClick={onToggleAudio}
                  variant="ghost"
                  size="icon"
                  className={`rounded-full w-12 h-12 ${
                    callState.isAudioEnabled
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {callState.isAudioEnabled ? (
                    <Mic className="w-5 h-5" />
                  ) : (
                    <MicOff className="w-5 h-5" />
                  )}
                </Button>

                {/* Toggle Video (only for video calls) */}
                {callState.callType === 'video' && (
                  <Button
                    onClick={onToggleVideo}
                    variant="ghost"
                    size="icon"
                    className={`rounded-full w-12 h-12 ${
                      callState.isVideoEnabled
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {callState.isVideoEnabled ? (
                      <Video className="w-5 h-5" />
                    ) : (
                      <VideoOff className="w-5 h-5" />
                    )}
                  </Button>
                )}

                {/* End Call */}
                <Button
                  onClick={onEnd}
                  variant="destructive"
                  size="icon"
                  className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600"
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </motion.div>
            )}

            {/* Close Button */}
            <Button
              onClick={onEnd}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 rounded-full w-10 h-10 bg-black/30 hover:bg-black/50 text-white"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Call Status */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-lg">
              {callState.isConnected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white text-sm">Đang kết nối</span>
                </>
              ) : callState.isCalling ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-white text-sm">Đang gọi...</span>
                </>
              ) : null}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoCallModal;
