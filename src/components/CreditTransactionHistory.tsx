import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Gift, 
  RotateCcw,
  Filter,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  description: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  status: string;
  created_at: string;
}

interface CreditTransactionHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
}

const typeConfig: Record<string, { icon: typeof ArrowDownCircle; color: string; label: string; bgColor: string }> = {
  purchase: { 
    icon: ArrowDownCircle, 
    color: "text-emerald-600", 
    label: "Nạp tiền",
    bgColor: "bg-emerald-500/10"
  },
  usage: { 
    icon: ArrowUpCircle, 
    color: "text-rose-600", 
    label: "Sử dụng",
    bgColor: "bg-rose-500/10"
  },
  bonus: { 
    icon: Gift, 
    color: "text-amber-600", 
    label: "Thưởng",
    bgColor: "bg-amber-500/10"
  },
  refund: { 
    icon: RotateCcw, 
    color: "text-blue-600", 
    label: "Hoàn tiền",
    bgColor: "bg-blue-500/10"
  },
};

const statusConfig: Record<string, { color: string; label: string }> = {
  completed: { color: "bg-emerald-500/20 text-emerald-700", label: "Hoàn thành" },
  pending: { color: "bg-amber-500/20 text-amber-700", label: "Đang xử lý" },
  failed: { color: "bg-rose-500/20 text-rose-700", label: "Thất bại" },
  cancelled: { color: "bg-muted text-muted-foreground", label: "Đã hủy" },
};

export default function CreditTransactionHistory({ 
  transactions, 
  isLoading 
}: CreditTransactionHistoryProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredTransactions = filter === "all" 
    ? transactions 
    : transactions.filter(t => t.transaction_type === filter);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-lg bg-muted/30">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
            <div className="h-6 bg-muted rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground">Chưa có giao dịch nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Lọc theo loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="purchase">Nạp tiền</SelectItem>
            <SelectItem value="usage">Sử dụng</SelectItem>
            <SelectItem value="bonus">Thưởng</SelectItem>
            <SelectItem value="refund">Hoàn tiền</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        {filteredTransactions.map((tx, index) => {
          const config = typeConfig[tx.transaction_type] || typeConfig.usage;
          const status = statusConfig[tx.status] || statusConfig.pending;
          const Icon = config.icon;
          const isPositive = tx.amount > 0;

          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:border-border transition-colors ${config.bgColor}`}
            >
              <div className={`p-2 rounded-full ${config.bgColor}`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground truncate">
                    {tx.description || config.label}
                  </span>
                  <Badge variant="secondary" className={status.color}>
                    {status.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{format(new Date(tx.created_at), "dd/MM/yyyy HH:mm", { locale: vi })}</span>
                  {tx.payment_reference && (
                    <>
                      <span>•</span>
                      <span className="font-mono">{tx.payment_reference}</span>
                    </>
                  )}
                </div>
              </div>

              <div className={`text-right font-semibold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                {isPositive ? "+" : ""}{tx.amount.toLocaleString("vi-VN")}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredTransactions.length === 0 && filter !== "all" && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Không có giao dịch nào thuộc loại này</p>
          <Button variant="ghost" size="sm" onClick={() => setFilter("all")} className="mt-2">
            Xem tất cả
          </Button>
        </div>
      )}
    </div>
  );
}
