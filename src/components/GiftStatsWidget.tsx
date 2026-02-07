import { motion } from "framer-motion";
import { Gift, TrendingUp, Sparkles, Medal, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGiftStats } from "@/hooks/useGiftStats";

import camlyCoinAvatar from "@/assets/camly-coin-avatar.png";
import funMoneyAvatar from "@/assets/fun-money-avatar.png";

export default function GiftStatsWidget() {
  const { stats, isLoading } = useGiftStats();

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-gold/5 to-rose-500/5 border-gold/20">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-8 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRankBadge = (rank: number | null) => {
    if (!rank) return null;
    if (rank === 1) return { label: "🥇 Gold", color: "text-gold" };
    if (rank === 2) return { label: "🥈 Silver", color: "text-slate-400" };
    if (rank === 3) return { label: "🥉 Bronze", color: "text-amber-700" };
    if (rank <= 10) return { label: `#${rank} Top 10`, color: "text-violet-500" };
    return { label: `#${rank}`, color: "text-muted-foreground" };
  };

  const badge = getRankBadge(stats.sponsorRank);

  return (
    <Card className="bg-gradient-to-br from-gold/5 via-rose-500/5 to-violet-500/5 border-gold/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-rose-500" />
            Thống kê tặng thưởng
          </span>
          {badge && (
            <span className={`text-sm font-bold ${badge.color}`}>
              {badge.label}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Sent */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-rose-500/10 to-pink-500/10 border border-rose-500/20">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-500" />
            <span className="text-sm text-muted-foreground">Đã tặng</span>
          </div>
          <div className="text-right">
            <p className="font-bold text-foreground">
              {stats.totalAmountSent.toLocaleString("vi-VN")}
            </p>
            <p className="text-xs text-muted-foreground">{stats.totalSent} lần</p>
          </div>
        </div>

        {/* Received */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-muted-foreground">Đã nhận</span>
          </div>
          <div className="text-right">
            <p className="font-bold text-foreground">
              {stats.totalAmountReceived.toLocaleString("vi-VN")}
            </p>
            <p className="text-xs text-muted-foreground">{stats.totalReceived} lần</p>
          </div>
        </div>

        {/* Light Score */}
        {stats.lightScoreEarned > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gold/10 border border-gold/20"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm text-gold font-medium">
              +{stats.lightScoreEarned} Light Score điểm
            </span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
