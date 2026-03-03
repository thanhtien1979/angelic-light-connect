import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { useCamlyCoin } from "@/hooks/useCamlyCoin";
import { toast } from "sonner";

interface ClaimHistory {
  id: string;
  transaction_type: string;
  amount: number;
  status: string;
  created_at: string;
  transaction_hash: string | null;
  network: string | null;
}

const MAX_CLAIMS_PER_DAY = 3;
const MIN_CLAIM_AMOUNT = 100;
const COOLDOWN_SECONDS = 60;

export const useWeb3Rewards = () => {
  const { user } = useAuth();
  const { walletAddress } = useWallet();
  const { balance, refetch: refetchBalance } = useCamlyCoin();
  const [claimHistory, setClaimHistory] = useState<ClaimHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [todayClaimCount, setTodayClaimCount] = useState(0);
  const [lastClaimTime, setLastClaimTime] = useState<Date | null>(null);

  // Fetch claim history via edge function
  const fetchClaimHistory = useCallback(async () => {
    if (!user) return;
    setIsLoadingHistory(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-wallet-transactions?limit=50`,
        {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      
      const claims = (data.transactions || []).filter(
        (tx: ClaimHistory) => tx.transaction_type === "web3_claim"
      );
      setClaimHistory(claims);

      // Count today's claims
      const today = new Date().toISOString().split("T")[0];
      const todaysClaims = claims.filter((tx: ClaimHistory) => 
        tx.created_at.startsWith(today)
      );
      setTodayClaimCount(todaysClaims.length);

      // Get last claim time
      if (claims.length > 0) {
        setLastClaimTime(new Date(claims[0].created_at));
      }
    } catch (error) {
      console.error("Error fetching claim history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    fetchClaimHistory();
  }, [fetchClaimHistory]);

  // Check cooldown remaining
  const getCooldownRemaining = useCallback((): number => {
    if (!lastClaimTime) return 0;
    const elapsed = (Date.now() - lastClaimTime.getTime()) / 1000;
    return Math.max(0, Math.ceil(COOLDOWN_SECONDS - elapsed));
  }, [lastClaimTime]);

  // Can claim checks
  const canClaim = useCallback((): { ok: boolean; reason?: string } => {
    if (!user) return { ok: false, reason: "Vui lòng đăng nhập" };
    if (!walletAddress) return { ok: false, reason: "Vui lòng kết nối ví Web3" };
    if (balance.total_coins < MIN_CLAIM_AMOUNT) return { ok: false, reason: `Cần tối thiểu ${MIN_CLAIM_AMOUNT} CAMLY` };
    if (todayClaimCount >= MAX_CLAIMS_PER_DAY) return { ok: false, reason: `Đã đạt giới hạn ${MAX_CLAIMS_PER_DAY} lần/ngày` };
    const cooldown = getCooldownRemaining();
    if (cooldown > 0) return { ok: false, reason: `Đợi ${cooldown}s trước khi claim tiếp` };
    return { ok: true };
  }, [user, walletAddress, balance.total_coins, todayClaimCount, getCooldownRemaining]);

  // Claim to wallet
  const claimToWallet = useCallback(async (amount: number, network: string) => {
    const check = canClaim();
    if (!check.ok) {
      toast.error(check.reason);
      return null;
    }

    if (amount < MIN_CLAIM_AMOUNT) {
      toast.error(`Tối thiểu ${MIN_CLAIM_AMOUNT} CAMLY`);
      return null;
    }

    if (amount > balance.total_coins) {
      toast.error("Số dư không đủ");
      return null;
    }

    setIsClaiming(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error("Vui lòng đăng nhập lại");
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claim-web3-reward`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount, network }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Claim thất bại");
        return null;
      }

      // Refresh data
      await refetchBalance();
      await fetchClaimHistory();

      return result;
    } catch (error) {
      console.error("Claim error:", error);
      toast.error("Lỗi hệ thống. Vui lòng thử lại.");
      return null;
    } finally {
      setIsClaiming(false);
    }
  }, [canClaim, balance.total_coins, refetchBalance, fetchClaimHistory]);

  return {
    claimHistory,
    isLoadingHistory,
    isClaiming,
    todayClaimCount,
    lastClaimTime,
    claimableBalance: balance.total_coins,
    canClaim,
    claimToWallet,
    getCooldownRemaining,
    refetchHistory: fetchClaimHistory,
    MAX_CLAIMS_PER_DAY,
    MIN_CLAIM_AMOUNT,
  };
};
