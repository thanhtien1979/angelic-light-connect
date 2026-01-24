import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePrivateMessages } from '@/hooks/usePrivateMessages';
import { useAuth } from '@/hooks/useAuth';
import { useVideoCall } from '@/hooks/useVideoCall';
import PrivateChat from './PrivateChat';
import GroupChat from './GroupChat';
import VideoCallModal from './VideoCallModal';

const ChatButton = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const { getTotalUnread } = usePrivateMessages();

  const {
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
  } = useVideoCall();

  if (!user) return null;

  const unreadCount = getTotalUnread();

  const handleStartCall = (friendId: string, friendName: string, callType: 'video' | 'audio') => {
    initiateCall(friendId, friendName, callType);
  };

  return (
    <>
      {/* Group Chat Button */}
      <motion.button
        onClick={() => setIsGroupOpen(!isGroupOpen)}
        className="fixed bottom-4 right-20 w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full shadow-lg flex items-center justify-center text-white z-40 hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
        title="Nhóm chat"
      >
        <Users className="w-5 h-5" />
      </motion.button>

      {/* Private Chat Button */}
      <motion.button
        data-chat-button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full shadow-lg flex items-center justify-center text-white z-40 hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-amber-500 text-white min-w-5 h-5 flex items-center justify-center text-xs animate-pulse">
            {unreadCount}
          </Badge>
        )}
      </motion.button>

      <PrivateChat 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onStartCall={handleStartCall}
      />

      <GroupChat
        isOpen={isGroupOpen}
        onClose={() => setIsGroupOpen(false)}
      />

      <VideoCallModal
        isOpen={callState.isActive}
        callState={callState}
        localStream={localStream}
        remoteStream={remoteStream}
        onAccept={acceptCall}
        onReject={rejectCall}
        onEnd={endCall}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onToggleScreenShare={toggleScreenShare}
      />
    </>
  );
};

export default ChatButton;
