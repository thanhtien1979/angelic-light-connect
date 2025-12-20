import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFriendships } from '@/hooks/useFriendships';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, memberIds: string[]) => Promise<any>;
}

const CreateGroupDialog = ({ isOpen, onClose, onCreateGroup }: CreateGroupDialogProps) => {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const { friends } = useFriendships();

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;

    setCreating(true);
    try {
      await onCreateGroup(groupName, selectedMembers);
      setGroupName('');
      setSelectedMembers([]);
      onClose();
    } finally {
      setCreating(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-rose-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-700">
            <Users className="w-5 h-5" />
            Tạo nhóm mới
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group Name Input */}
          <div>
            <label className="text-sm text-rose-600 mb-1 block">Tên nhóm</label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nhập tên nhóm..."
              className="border-rose-200 focus:border-pink-400"
            />
          </div>

          {/* Friend Selection */}
          <div>
            <label className="text-sm text-rose-600 mb-2 block">
              Chọn thành viên ({selectedMembers.length} đã chọn)
            </label>
            
            <ScrollArea className="h-[250px] border border-rose-100 rounded-lg p-2">
              {friends.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Users className="w-10 h-10 text-rose-300 mb-2" />
                  <p className="text-rose-500 text-sm">Chưa có bạn bè</p>
                  <p className="text-rose-400 text-xs">Kết bạn để tạo nhóm!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {friends.map((friendship) => {
                    const profile = friendship.requester || friendship.addressee;
                    const isSelected = selectedMembers.includes(profile?.id || '');

                    return (
                      <motion.button
                        key={friendship.id}
                        onClick={() => profile?.id && toggleMember(profile.id)}
                        className={`w-full p-2 flex items-center gap-3 rounded-lg transition-colors ${
                          isSelected ? 'bg-rose-100' : 'hover:bg-rose-50'
                        }`}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={profile?.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-rose-400 to-pink-500 text-white text-sm">
                            {getInitials(profile?.display_name || null)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="flex-1 text-left text-rose-800 font-medium">
                          {profile?.display_name || 'Người dùng'}
                        </span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-rose-500' : 'border-2 border-rose-300'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-rose-200"
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!groupName.trim() || selectedMembers.length === 0 || creating}
              className="flex-1 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600"
            >
              {creating ? 'Đang tạo...' : 'Tạo nhóm'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;