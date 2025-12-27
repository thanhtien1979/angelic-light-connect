import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFollowList, useFollow } from '@/hooks/useFollow';
import { useNavigate } from 'react-router-dom';
import { User, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
  title: string;
}

const FollowUserItem = ({ profile, onNavigate }: { profile: any; onNavigate: (id: string) => void }) => {
  const { user } = useAuth();
  const { isFollowing, isLoading, toggleFollow } = useFollow(profile.id);
  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div 
        className="flex items-center gap-3 cursor-pointer flex-1"
        onClick={() => onNavigate(profile.id)}
      >
        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
            <User className="h-5 w-5 text-primary" />
          </AvatarFallback>
        </Avatar>
        <span className="font-medium text-foreground">
          {profile.display_name || 'Linh hồn ẩn danh'}
        </span>
      </div>
      
      {!isOwnProfile && (
        <Button
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleFollow();
          }}
          disabled={isLoading}
          className="gap-1"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isFollowing ? (
            <>
              <UserMinus className="h-4 w-4" />
              Hủy
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Theo dõi
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export const FollowListModal = ({ isOpen, onClose, userId, type, title }: FollowListModalProps) => {
  const navigate = useNavigate();
  const { users, isLoading } = useFollowList(userId, type);

  const handleNavigate = (profileId: string) => {
    onClose();
    navigate(`/user/${profileId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{type === 'followers' ? 'Chưa có người theo dõi' : 'Chưa theo dõi ai'}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {users.map((profile) => (
                <FollowUserItem 
                  key={profile.id} 
                  profile={profile} 
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
