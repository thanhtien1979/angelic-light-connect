import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Sparkles, Users, Heart, Star, 
  ChevronRight, RefreshCw, Circle, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFriendSuggestions, SuggestedFriend } from '@/hooks/useFriendSuggestions';
import { useFriendships } from '@/hooks/useFriendships';

const FriendSuggestions = () => {
  const { suggestions, loading, refetch } = useFriendSuggestions();
  const { sendFriendRequest } = useFriendships();
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSendRequest = async (userId: string) => {
    setSendingTo(userId);
    const success = await sendFriendRequest(userId);
    if (success) {
      setDismissed(prev => new Set([...prev, userId]));
    }
    setSendingTo(null);
  };

  const handleDismiss = (userId: string) => {
    setDismissed(prev => new Set([...prev, userId]));
  };

  const visibleSuggestions = suggestions.filter(s => !dismissed.has(s.id));

  const getReasonIcon = (suggestion: SuggestedFriend) => {
    if (suggestion.mutual_friends_count && suggestion.mutual_friends_count > 0) {
      return <Users className="w-3 h-3" />;
    }
    if (suggestion.shared_interests && suggestion.shared_interests.length > 0) {
      return <Heart className="w-3 h-3" />;
    }
    if (suggestion.is_online) {
      return <Zap className="w-3 h-3" />;
    }
    return <Star className="w-3 h-3" />;
  };

  const getReasonColor = (suggestion: SuggestedFriend) => {
    if (suggestion.mutual_friends_count && suggestion.mutual_friends_count > 0) {
      return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800';
    }
    if (suggestion.shared_interests && suggestion.shared_interests.length > 0) {
      return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800';
    }
    if (suggestion.is_online) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800';
    }
    return 'bg-gold/10 text-gold border-gold/20';
  };

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-5 h-5 text-primary animate-spin" />
            <span className="text-muted-foreground">Đang tìm gợi ý...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleSuggestions.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="p-6 text-center">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Không có gợi ý nào lúc này</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={refetch}
            className="mt-3 gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-gold/20">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span>Gợi ý kết bạn</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={refetch}
            className="h-8 w-8"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y divide-border/30">
          <AnimatePresence mode="popLayout">
            {visibleSuggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-12 h-12 ring-2 ring-border">
                        <AvatarImage src={suggestion.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-gold/30 text-foreground font-medium">
                          {getInitials(suggestion.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      {suggestion.is_online && (
                        <Circle className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 fill-emerald-400 text-emerald-400 ring-2 ring-card" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {suggestion.display_name || 'Người dùng'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs gap-1 ${getReasonColor(suggestion)}`}
                        >
                          {getReasonIcon(suggestion)}
                          {suggestion.reason}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleSendRequest(suggestion.id)}
                      disabled={sendingTo === suggestion.id}
                      className="bg-gradient-to-r from-primary to-gold hover:opacity-90 text-primary-foreground gap-1.5"
                    >
                      {sendingTo === suggestion.id ? (
                        <Sparkles className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span className="hidden sm:inline">Kết bạn</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDismiss(suggestion.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Shared interests display */}
                {suggestion.shared_interests && suggestion.shared_interests.length > 0 && (
                  <div className="mt-2 pl-15 flex flex-wrap gap-1">
                    {suggestion.shared_interests.slice(0, 3).map((interest, i) => (
                      <span 
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-rose-100/50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-300"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendSuggestions;
