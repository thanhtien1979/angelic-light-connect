import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const useWallet = () => {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved wallet from database
  useEffect(() => {
    const loadSavedWallet = async () => {
      if (!user) {
        setWalletAddress(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_wallets")
          .select("wallet_address")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setWalletAddress(data.wallet_address);
        }
      } catch (error) {
        console.error("Error loading wallet:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedWallet();
  }, [user]);

  // Save wallet to database
  const saveWallet = useCallback(async (address: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_wallets")
        .upsert({
          user_id: user.id,
          wallet_address: address,
          wallet_type: "metamask",
        }, {
          onConflict: "user_id",
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving wallet:", error);
    }
  }, [user]);

  // Remove wallet from database
  const removeWallet = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_wallets")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error removing wallet:", error);
    }
  }, [user]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === "undefined") {
      toast.error("Vui lòng cài đặt MetaMask để kết nối blockchain");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        
        if (user) {
          await saveWallet(address);
          toast.success("Đã kết nối và lưu địa chỉ ví!");
        } else {
          toast.success("Đã kết nối ví! Đăng nhập để lưu địa chỉ.");
        }
      }
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error("Bạn đã từ chối kết nối ví");
      } else {
        toast.error("Không thể kết nối blockchain");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [user, saveWallet]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    setWalletAddress(null);
    
    if (user) {
      await removeWallet();
    }
    
    toast.success("Đã ngắt kết nối ví");
  }, [user, removeWallet]);

  return {
    walletAddress,
    isConnecting,
    isLoading,
    connectWallet,
    disconnectWallet,
  };
};
