import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Medal, 
  Crown, 
  Sparkles, 
  Gift,
  TrendingUp,
  RefreshCw,
  Download,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import camlyCoinAvatar from "@/assets/camly-coin-avatar.png";
import funMoneyAvatar from "@/assets/fun-money-avatar.png";

interface TopSponsor {
  sender_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_gifts: number;
  total_amount: number;
  coin_type: string;
}

const coinIcons: Record<string, string> = {
  camly_coin: camlyCoinAvatar,
  fun_money: funMoneyAvatar,
};

const coinLabels: Record<string, string> = {
  camly_coin: "CAMLY",
  fun_money: "FUN",
  bnb: "BNB",
  usdt: "USDT",
};

type TimeFilter = "daily" | "weekly" | "all";

export default function TopSponsorsLeaderboard({ 
  compact = false,
  showExport = false,
}: { 
  compact?: boolean;
  showExport?: boolean;
}) {
  const [sponsors, setSponsors] = useState<TopSponsor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  useEffect(() => {
    fetchTopSponsors();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel("gift_transactions_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "gift_transactions" },
        () => {
          fetchTopSponsors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [timeFilter]);

  const fetchTopSponsors = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("gift_transactions")
        .select(`
          sender_id,
          amount,
          coin_type,
          created_at
        `)
        .eq("status", "completed");

      // Apply time filter
      if (timeFilter === "daily") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        query = query.gte("created_at", today.toISOString());
      } else if (timeFilter === "weekly") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte("created_at", weekAgo.toISOString());
      }

      const { data: transactions, error } = await query;

      if (error) throw error;

      // Aggregate by sender
      const aggregated = new Map<string, { total: number; count: number; coinType: string }>();
      transactions?.forEach((tx) => {
        const key = tx.sender_id;
        const existing = aggregated.get(key) || { total: 0, count: 0, coinType: tx.coin_type };
        existing.total += parseFloat(String(tx.amount));
        existing.count += 1;
        aggregated.set(key, existing);
      });

      // Get profile data for top senders
      const senderIds = Array.from(aggregated.keys());
      if (senderIds.length === 0) {
        setSponsors([]);
        setIsLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", senderIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Build sorted list
      const sorted = Array.from(aggregated.entries())
        .map(([senderId, data]) => ({
          sender_id: senderId,
          display_name: profileMap.get(senderId)?.display_name || null,
          avatar_url: profileMap.get(senderId)?.avatar_url || null,
          total_gifts: data.count,
          total_amount: data.total,
          coin_type: data.coinType,
        }))
        .sort((a, b) => b.total_amount - a.total_amount)
        .slice(0, compact ? 5 : 10);

      setSponsors(sorted);
    } catch (error) {
      console.error("Error fetching top sponsors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Crown className="w-5 h-5 text-gold" />;
      case 1:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-700" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank + 1}</span>;
    }
  };

  const getRankBadge = (rank: number): string | null => {
    switch (rank) {
      case 0:
        return "Light Giver ✨ Gold";
      case 1:
        return "Light Giver 🥈 Silver";
      case 2:
        return "Light Giver 🥉 Bronze";
      default:
        return null;
    }
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = ["Rank", "Name", "Total Gifts", "Total Amount", "Coin Type"];
    const rows = sponsors.map((s, i) => [
      i + 1,
      s.display_name || "Anonymous",
      s.total_gifts,
      s.total_amount,
      coinLabels[s.coin_type] || s.coin_type,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `top-sponsors-${timeFilter}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-gold/5 to-rose-500/5 border-gold/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gold" />
            Mạnh Thường Quân
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : sponsors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có giao dịch tặng thưởng
            </p>
          ) : (
            <>
              {sponsors.slice(0, 5).map((sponsor, idx) => (
                <Link
                  key={sponsor.sender_id}
                  to={`/user/${sponsor.sender_id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {getRankIcon(idx)}
                  <Avatar className="w-8 h-8 ring-2 ring-gold/20">
                    <AvatarImage src={sponsor.avatar_url || ""} />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-gold/30 to-rose-500/30">
                      {getInitials(sponsor.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {sponsor.display_name || "Ẩn danh"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {coinIcons[sponsor.coin_type] && (
                      <img src={coinIcons[sponsor.coin_type]} alt="" className="w-4 h-4 rounded-full" />
                    )}
                    <span className="text-sm font-bold text-gold">
                      {sponsor.total_amount.toLocaleString("vi-VN")}
                    </span>
                  </div>
                </Link>
              ))}
              <Link
                to="/community"
                className="flex items-center justify-center gap-1 text-sm text-gold hover:text-gold/80 pt-2"
              >
                Xem thêm <ChevronRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gold/5 via-rose-500/5 to-violet-500/5 border-gold/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold" />
            Bảng Xếp Hạng Mạnh Thường Quân
          </CardTitle>
          <div className="flex items-center gap-2">
            {showExport && (
              <Button variant="outline" size="sm" onClick={exportToExcel} className="border-gold/30">
                <Download className="w-4 h-4 mr-1" />
                Excel
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={fetchTopSponsors} className="h-8 w-8">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Hôm nay</TabsTrigger>
            <TabsTrigger value="weekly">Tuần này</TabsTrigger>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gold" />
          </div>
        ) : sponsors.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Chưa có giao dịch tặng thưởng</p>
            <p className="text-sm text-muted-foreground/70">
              Hãy là người đầu tiên lan tỏa yêu thương!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sponsors.map((sponsor, idx) => (
              <motion.div
                key={sponsor.sender_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  to={`/user/${sponsor.sender_id}`}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                    idx === 0
                      ? "bg-gradient-to-r from-gold/20 to-amber-500/20 border border-gold/30 shadow-lg shadow-gold/10"
                      : idx === 1
                      ? "bg-gradient-to-r from-slate-500/10 to-slate-400/10 border border-slate-400/20"
                      : idx === 2
                      ? "bg-gradient-to-r from-amber-700/10 to-amber-600/10 border border-amber-700/20"
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="w-8 flex items-center justify-center">
                    {getRankIcon(idx)}
                  </div>

                  <Avatar className={`w-12 h-12 ring-2 ${idx === 0 ? "ring-gold" : idx === 1 ? "ring-slate-400" : idx === 2 ? "ring-amber-700" : "ring-border"}`}>
                    <AvatarImage src={sponsor.avatar_url || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-gold/30 to-rose-500/30 text-sm">
                      {getInitials(sponsor.display_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {sponsor.display_name || "Linh hồn ẩn danh"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {sponsor.total_gifts} lần tặng
                      </span>
                      {getRankBadge(idx) && (
                        <Badge variant="outline" className="text-xs border-gold/30 text-gold">
                          {getRankBadge(idx)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {coinIcons[sponsor.coin_type] && (
                        <img src={coinIcons[sponsor.coin_type]} alt="" className="w-5 h-5 rounded-full" />
                      )}
                      <span className={`font-bold ${idx === 0 ? "text-xl text-gold" : "text-lg text-foreground"}`}>
                        {sponsor.total_amount.toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {coinLabels[sponsor.coin_type] || sponsor.coin_type}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
