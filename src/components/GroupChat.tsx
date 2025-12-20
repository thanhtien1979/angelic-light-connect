import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, ArrowLeft, X, Users, Plus,
  Sparkles, Image as ImageIcon, Settings, UserPlus, LogOut, Paperclip, Download, Reply, CornerUpLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useGroupChat, GroupChat as GroupChatType, GroupMessage } from '@/hooks/useGroupChat';
import { useAuth } from '@/hooks/useAuth';
import EmojiPicker from './EmojiPicker';
import StickerPicker, { STICKER_PACKS } from './StickerPicker';
import CreateGroupDialog from './CreateGroupDialog';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GroupChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const GroupChatComponent = ({ isOpen, onClose }: GroupChatProps) => {
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<GroupChatType | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [replyingTo, setReplyingTo] = useState<GroupMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const { 
    groups,
    messages, 
    members,
    loading, 
    sending,
    createGroup,
    sendMessage,
    sendImageMessage,
    sendFileMessage,
    leaveGroup,
  } = useGroupChat(selectedGroup?.id);

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
    
    const success = await sendMessage(messageInput, undefined, replyingTo?.id);
    if (success) {
      setMessageInput('');
      setReplyingTo(null);
    }
  };

  const handleReply = (msg: GroupMessage) => {
    setReplyingTo(msg);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
  };

  const handleStickerSelect = async (stickerId: string, emoji: string) => {
    await sendMessage(emoji, stickerId);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedGroup) return;

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

      const fileExt = file.name.split('.').pop();
      const fileName = `groups/${selectedGroup.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('generated-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('generated-images')
        .getPublicUrl(fileName);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedGroup) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ file PDF, Word, Excel hoặc Text');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File phải nhỏ hơn 10MB');
      return;
    }

    try {
      setUploadingFile(true);

      const fileName = `groups/${selectedGroup.id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      await sendFileMessage(urlData.publicUrl, file.name, file.type);
      toast.success('Đã gửi file! 📎');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Không thể tải lên file');
    } finally {
      setUploadingFile(false);
      if (docInputRef.current) {
        docInputRef.current.value = '';
      }
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStickerEmoji = (stickerId: string): string => {
    for (const pack of Object.values(STICKER_PACKS)) {
      const sticker = pack.stickers.find(s => s.id === stickerId);
      if (sticker) return sticker.emoji;
    }
    return '🎭';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
    if (fileType?.includes('excel') || fileType?.includes('sheet')) return '📊';
    return '📎';
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
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-[380px] w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl border border-purple-200 overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white p-4 flex items-center justify-between">
              {selectedGroup ? (
                <>
                  <button 
                    onClick={() => { setSelectedGroup(null); setShowMembers(false); }}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2 flex-1 ml-2">
                    <Avatar className="w-8 h-8 ring-2 ring-white/50">
                      <AvatarFallback className="bg-purple-600 text-white text-xs">
                        {getInitials(selectedGroup.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{selectedGroup.name}</p>
                      <p className="text-xs text-white/80">
                        {selectedGroup.memberCount} thành viên
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowMembers(!showMembers)}
                      className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                      title="Thành viên"
                    >
                      <Users className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => leaveGroup(selectedGroup.id)}
                      className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-red-200"
                      title="Rời nhóm"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span className="font-bold">Nhóm chat</span>
                  </div>
                  <button
                    onClick={() => setShowCreateDialog(true)}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                    title="Tạo nhóm mới"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </>
              )}
              <button 
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {selectedGroup ? (
              showMembers ? (
                // Members View
                <ScrollArea className="flex-1 p-4">
                  <p className="text-sm text-purple-600 font-medium mb-3">
                    Thành viên ({members.length})
                  </p>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-purple-50">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.profile?.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-500 text-white text-sm">
                            {getInitials(member.profile?.display_name || null)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-purple-800">
                            {member.profile?.display_name || 'Người dùng'}
                          </p>
                          {member.role === 'admin' && (
                            <Badge className="bg-purple-100 text-purple-600 text-xs">
                              Quản trị
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                // Messages View
                <>
                  <ScrollArea className="flex-1 p-4">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <Sparkles className="w-6 h-6 text-purple-400 animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Users className="w-12 h-12 text-purple-300 mb-3" />
                        <p className="text-purple-600 font-medium">Bắt đầu trò chuyện!</p>
                        <p className="text-purple-400 text-sm">Gửi tin nhắn đầu tiên 💫</p>
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
                              className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}
                            >
                              <div className="flex gap-2 max-w-[85%] items-end">
                                {/* Reply button for other's messages */}
                                {!isMine && (
                                  <button
                                    onClick={() => handleReply(msg)}
                                    className="p-1 rounded-full hover:bg-purple-100 opacity-0 group-hover:opacity-100 transition-opacity mb-1"
                                    title="Trả lời"
                                  >
                                    <CornerUpLeft className="w-3.5 h-3.5 text-purple-400" />
                                  </button>
                                )}
                                
                                {!isMine && (
                                  <Avatar className="w-6 h-6 mt-1">
                                    <AvatarImage src={msg.sender_profile?.avatar_url || ''} />
                                    <AvatarFallback className="bg-purple-400 text-white text-xs">
                                      {getInitials(msg.sender_profile?.display_name || null)}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <div>
                                  {!isMine && (
                                    <p className="text-xs text-purple-500 mb-1">
                                      {msg.sender_profile?.display_name || 'Người dùng'}
                                    </p>
                                  )}
                                  <div
                                    className={`px-3 py-2 rounded-2xl ${
                                      isMine
                                        ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white rounded-br-sm'
                                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                                    }`}
                                  >
                                    {/* Reply preview */}
                                    {msg.reply_to && (
                                      <div className={`text-xs mb-2 p-2 rounded-lg border-l-2 ${
                                        isMine 
                                          ? 'bg-white/20 border-white/50' 
                                          : 'bg-gray-200 border-purple-300'
                                      }`}>
                                        <p className={`font-medium ${isMine ? 'text-white/90' : 'text-purple-500'}`}>
                                          {msg.reply_to.sender_id === user.id 
                                            ? 'Bạn' 
                                            : msg.reply_to.sender_profile?.display_name || 'Người dùng'}
                                        </p>
                                        <p className={`truncate ${isMine ? 'text-white/70' : 'text-gray-600'}`}>
                                          {msg.reply_to.content}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {msg.sticker_id && (
                                      <span className="text-4xl block text-center">
                                        {getStickerEmoji(msg.sticker_id)}
                                      </span>
                                    )}
                                    {msg.image_url && (
                                      <img 
                                        src={msg.image_url} 
                                        alt="Shared image" 
                                        className="rounded-lg mb-2 max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => window.open(msg.image_url!, '_blank')}
                                      />
                                    )}
                                    {msg.file_url && msg.file_name && (
                                      <a
                                        href={msg.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 p-2 rounded-lg mb-2 ${
                                          isMine ? 'bg-white/20 hover:bg-white/30' : 'bg-white hover:bg-gray-50'
                                        } transition-colors`}
                                      >
                                        <span className="text-2xl">{getFileIcon(msg.file_type || '')}</span>
                                        <div className="flex-1 min-w-0">
                                          <p className={`text-sm font-medium truncate ${isMine ? 'text-white' : 'text-gray-800'}`}>
                                            {msg.file_name}
                                          </p>
                                          <p className={`text-xs ${isMine ? 'text-white/70' : 'text-gray-500'}`}>
                                            Nhấn để tải xuống
                                          </p>
                                        </div>
                                        <Download className={`w-4 h-4 ${isMine ? 'text-white/80' : 'text-gray-600'}`} />
                                      </a>
                                    )}
                                    {!msg.sticker_id && msg.content && msg.content !== '📷 Hình ảnh' && !msg.content.startsWith('📎') && (
                                      <p className="text-sm">{msg.content}</p>
                                    )}
                                    <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                                      {format(new Date(msg.created_at), 'HH:mm')}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Reply button for my messages */}
                                {isMine && (
                                  <button
                                    onClick={() => handleReply(msg)}
                                    className="p-1 rounded-full hover:bg-purple-100 opacity-0 group-hover:opacity-100 transition-opacity mb-1"
                                    title="Trả lời"
                                  >
                                    <CornerUpLeft className="w-3.5 h-3.5 text-purple-400" />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-3 border-t border-purple-100">
                    {/* Reply indicator */}
                    {replyingTo && (
                      <div className="flex items-center gap-2 mb-2 p-2 bg-purple-50 rounded-lg border-l-2 border-purple-400">
                        <Reply className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-purple-500 font-medium">
                            Đang trả lời {replyingTo.sender_id === user.id ? 'chính mình' : replyingTo.sender_profile?.display_name || 'Người dùng'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{replyingTo.content}</p>
                        </div>
                        <button 
                          onClick={cancelReply}
                          className="p-1 hover:bg-purple-100 rounded-full"
                        >
                          <X className="w-3 h-3 text-purple-400" />
                        </button>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <input
                      type="file"
                      ref={docInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                      className="hidden"
                    />
                    
                    <div className="flex items-center gap-1">
                      <EmojiPicker onSelect={handleEmojiSelect} />
                      <StickerPicker onSelect={handleStickerSelect} />
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-purple-400 hover:text-purple-600 hover:bg-purple-100"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage || uploadingFile}
                        title="Gửi hình ảnh"
                      >
                        {uploadingImage ? (
                          <Sparkles className="w-5 h-5 animate-spin" />
                        ) : (
                          <ImageIcon className="w-5 h-5" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-purple-400 hover:text-purple-600 hover:bg-purple-100"
                        onClick={() => docInputRef.current?.click()}
                        disabled={uploadingImage || uploadingFile}
                        title="Gửi tài liệu"
                      >
                        {uploadingFile ? (
                          <Sparkles className="w-5 h-5 animate-spin" />
                        ) : (
                          <Paperclip className="w-5 h-5" />
                        )}
                      </Button>
                      
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 border-purple-200 focus:border-indigo-400"
                        disabled={sending || uploadingImage || uploadingFile}
                      />
                      
                      <Button
                        onClick={handleSend}
                        disabled={!messageInput.trim() || sending || uploadingImage || uploadingFile}
                        className="bg-gradient-to-r from-purple-400 to-indigo-500 hover:from-purple-500 hover:to-indigo-600"
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
              )
            ) : (
              // Groups List
              <ScrollArea className="flex-1">
                {groups.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <Users className="w-12 h-12 text-purple-300 mb-3" />
                    <p className="text-purple-600 font-medium">Chưa có nhóm</p>
                    <p className="text-purple-400 text-sm mb-3">Tạo nhóm để chat cùng bạn bè!</p>
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-purple-400 to-indigo-500"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo nhóm mới
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-purple-100">
                    {groups.map((group) => (
                      <motion.button
                        key={group.id}
                        onClick={() => setSelectedGroup(group)}
                        className="w-full p-3 flex items-center gap-3 hover:bg-purple-50 transition-colors text-left"
                        whileHover={{ x: 4 }}
                      >
                        <Avatar className="w-12 h-12 ring-2 ring-purple-200">
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
                            {getInitials(group.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-purple-800 truncate">
                              {group.name}
                            </p>
                            <span className="text-xs text-purple-400">
                              {formatTime(group.lastMessageTime || group.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs border-purple-200 text-purple-500">
                              <Users className="w-3 h-3 mr-1" />
                              {group.memberCount}
                            </Badge>
                            {group.lastMessage && (
                              <p className="text-sm text-purple-600 truncate flex-1">
                                {group.lastMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreateGroup={createGroup}
      />
    </>
  );
};

export default GroupChatComponent;