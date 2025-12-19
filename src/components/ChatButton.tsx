import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePrivateMessages } from '@/hooks/usePrivateMessages';
import { useAuth } from '@/hooks/useAuth';
import PrivateChat from './PrivateChat';

const ChatButton = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { getTotalUnread } = usePrivateMessages();

  if (!user) return null;

  const unreadCount = getTotalUnread();

  return (
    <>
      <motion.button
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

      <PrivateChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChatButton;
