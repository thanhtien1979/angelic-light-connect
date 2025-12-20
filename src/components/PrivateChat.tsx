import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, ArrowLeft, X, Circle,
  Sparkles, Heart, Image as ImageIcon, Phone, Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { usePrivateMessages, Conversation } from '@/hooks/usePrivateMessages';
import { useAuth } from '@/hooks/useAuth';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import EmojiPicker from './EmojiPicker';
import StickerPicker, { STICKER_PACKS } from './StickerPicker';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PrivateChatProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCall?: (friendId: string, friendName: string, callType: 'video' | 'audio') => void;
}

const PrivateChat = ({ isOpen, onClose, onStartCall }: PrivateChatProps) => {
  const { user } = useAuth();
  const [selectedFriend, setSelectedFriend] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    messages, 
    conversations, 
    loading, 
    sending,
    sendMessage,
    sendImageMessage,
    getTotalUnread 
  } = usePrivateMessages(selectedFriend?.friendId);

  const { 
    isPartnerTyping, 
    handleTypingStart, 
    stopTyping 
  } = useTypingIndicator(selectedFriend?.friendId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async () => {
    if (!messageInput.trim() || sending) return;
    
    stopTyping();
    const success = await sendMessage(messageInput);
    if (success) {
      setMessageInput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    handleTypingStart();
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    handleTypingStart();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedFriend) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ hỗ trợ file hình ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Hình ảnh phải nhỏ hơn 5MB');
      return;
    }

    try {
      setUploadingImage(true);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('generated-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('generated-images')
        .getPublicUrl(fileName);

      // Send image message
      await sendImageMessage(urlData.publicUrl);
      toast.success('Đã gửi hình ảnh! 📷');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Không thể tải lên hình ảnh');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return format(date, 'HH:mm');
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return format(date, 'EEEE', { locale: vi });
    } else {
      return format(date, 'dd/MM');
    }
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-4 right-4 w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl border border-rose-200 overflow-hidden z-50 flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-400 to-pink-500 text-white p-4 flex items-center justify-between">
            {selectedFriend ? (
              <>
                <button 
                  onClick={() => setSelectedFriend(null)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 flex-1 ml-2">
                  <div className="relative">
                    <Avatar className="w-8 h-8 ring-2 ring-white/50">
                      <AvatarImage src={selectedFriend.friendAvatar || ''} />
                      <AvatarFallback className="bg-rose-600 text-white text-xs">
                        {getInitials(selectedFriend.friendName)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedFriend.isOnline && (
                      <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-green-400 text-green-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{selectedFriend.friendName}</p>
                    <p className="text-xs text-white/80">
                      {isPartnerTyping ? (
                        <span className="flex items-center gap-1">
                          <span className="animate-bounce">●</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                          <span className="ml-1">đang gõ...</span>
                        </span>
                      ) : selectedFriend.isOnline ? 'Đang online' : 'Offline'}
                    </p>
                  </div>
                </div>
                {/* Call Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onStartCall?.(selectedFriend.friendId, selectedFriend.friendName || 'Người dùng', 'audio')}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                    title="Gọi thoại"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onStartCall?.(selectedFriend.friendId, selectedFriend.friendName || 'Người dùng', 'video')}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                    title="Gọi video"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-bold">Tin nhắn</span>
                  {getTotalUnread() > 0 && (
                    <Badge className="bg-white text-rose-500 text-xs">
                      {getTotalUnread()}
                    </Badge>
                  )}
                </div>
              </>
            )}
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          {selectedFriend ? (
            // Messages View
            <>
              <ScrollArea className="flex-1 p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Sparkles className="w-6 h-6 text-rose-400 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Heart className="w-12 h-12 text-rose-300 mb-3" />
                    <p className="text-rose-600 font-medium">Bắt đầu cuộc trò chuyện!</p>
                    <p className="text-rose-400 text-sm">Gửi tin nhắn đầu tiên 💫</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isMine = msg.sender_id === user.id;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                              isMine
                                ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                            }`}
                          >
                            {msg.image_url && (
                              <img 
                                src={msg.image_url} 
                                alt="Shared image" 
                                className="rounded-lg mb-2 max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(msg.image_url!, '_blank')}
                              />
                            )}
                            {msg.content && msg.content !== '📷 Hình ảnh' && (
                              <p className="text-sm">{msg.content}</p>
                            )}
                            <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                              {format(new Date(msg.created_at), 'HH:mm')}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Typing Indicator */}
              {isPartnerTyping && (
                <div className="px-4 pb-2">
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-rose-400 text-xs"
                  >
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span>{selectedFriend?.friendName} đang gõ...</span>
                  </motion.div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-3 border-t border-rose-100">
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="flex items-center gap-1">
                  <EmojiPicker onSelect={handleEmojiSelect} />
                  <StickerPicker onSelect={async (stickerId, emoji) => {
                    await sendMessage(emoji);
                  }} />
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-100"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <Sparkles className="w-5 h-5 animate-spin" />
                    ) : (
                      <ImageIcon className="w-5 h-5" />
                    )}
                  </Button>
                  
                  <Input
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 border-rose-200 focus:border-pink-400"
                    disabled={sending || uploadingImage}
                  />
                  
                  <Button
                    onClick={handleSend}
                    disabled={!messageInput.trim() || sending || uploadingImage}
                    className="bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600"
                  >
                    {sending ? (
                      <Sparkles className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // Conversations List
            <ScrollArea className="flex-1">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <MessageCircle className="w-12 h-12 text-rose-300 mb-3" />
                  <p className="text-rose-600 font-medium">Chưa có tin nhắn</p>
                  <p className="text-rose-400 text-sm">Kết bạn để bắt đầu nhắn tin!</p>
                </div>
              ) : (
                <div className="divide-y divide-rose-100">
                  {conversations.map((conv) => (
                    <motion.button
                      key={conv.friendId}
                      onClick={() => setSelectedFriend(conv)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-rose-50 transition-colors text-left"
                      whileHover={{ x: 4 }}
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12 ring-2 ring-rose-200">
                          <AvatarImage src={conv.friendAvatar || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white">
                            {getInitials(conv.friendName)}
                          </AvatarFallback>
                        </Avatar>
                        {conv.isOnline && (
                          <Circle className="absolute bottom-0 right-0 w-3.5 h-3.5 fill-green-400 text-green-400 ring-2 ring-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-rose-800 truncate">
                            {conv.friendName}
                          </p>
                          <span className="text-xs text-rose-400">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-sm text-rose-600 truncate">
                          {conv.lastMessage}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-pink-500 text-white min-w-5 h-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrivateChat;
