import { motion, AnimatePresence } from 'framer-motion';
import { ShieldOff, UserX, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonUserItem } from '@/components/ui/skeleton';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const BlockedUsersList = () => {
  const { blockedUsers, loading, unblockUser } = useBlockedUsers();

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ShieldOff className="w-5 h-5 text-destructive" />
            Người dùng đã chặn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <SkeletonUserItem />
            <SkeletonUserItem />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <ShieldOff className="w-5 h-5 text-destructive" />
          Người dùng đã chặn
          {blockedUsers.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({blockedUsers.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {blockedUsers.length === 0 ? (
          <div className="text-center py-8">
            <UserX className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Bạn chưa chặn ai</p>
            <p className="text-sm text-muted-foreground/70">
              Người dùng bị chặn sẽ xuất hiện ở đây
            </p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {blockedUsers.map((blocked, index) => (
                <motion.div
                  key={blocked.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 ring-2 ring-destructive/30">
                      <AvatarImage src={blocked.profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-destructive/20 text-destructive">
                        {getInitials(blocked.profile?.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {blocked.profile?.display_name || 'Người dùng'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Đã chặn {format(new Date(blocked.created_at), 'dd/MM/yyyy', { locale: vi })}
                      </p>
                      {blocked.reason && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5 italic">
                          "{blocked.reason}"
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unblockUser(blocked.blocked_id)}
                    className="gap-1 text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700"
                  >
                    <Unlock className="w-4 h-4" />
                    <span className="hidden sm:inline">Bỏ chặn</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
};

export default BlockedUsersList;
