import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import "@/types/ethereum.d.ts";

export const useWallet = () => {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  // Handle account changes from MetaMask
  const handleAccountsChanged = useCallback((accounts: unknown[]) => {
    console.log("[Wallet] Accounts changed:", accounts);
    
    if (accounts.length === 0) {
      // User disconnected from MetaMask
      setWalletAddress(null);
      toast.info("Ví đã ngắt kết nối từ MetaMask");
    } else {
      const newAddress = accounts[0] as string;
      if (newAddress !== walletAddress) {
        setWalletAddress(newAddress);
        toast.success("Đã chuyển sang tài khoản ví mới");
      }
    }
  }, [walletAddress]);

  // Setup MetaMask event listeners
  useEffect(() => {
    if (typeof window.ethereum === "undefined") return;

    const ethereum = window.ethereum;
    
    // Listen for account changes
    ethereum.on?.("accountsChanged", handleAccountsChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, [handleAccountsChanged]);

  // Load saved wallet from database
  useEffect(() => {
    const loadSavedWallet = async () => {
      if (!user) {
        setWalletAddress(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log("[Wallet] Loading saved wallet for user:", user.id);
        const { data, error } = await supabase
          .from("user_wallets")
          .select("wallet_address")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          console.log("[Wallet] Found saved wallet:", data.wallet_address);
          setWalletAddress(data.wallet_address);
          
          // Try to verify if still connected to MetaMask
          if (typeof window.ethereum !== "undefined" && !hasInitialized.current) {
            hasInitialized.current = true;
            try {
              const accounts = await window.ethereum.request({ method: "eth_accounts" });
              if (accounts && accounts.length > 0) {
                const currentAddress = accounts[0].toLowerCase();
                const savedAddress = data.wallet_address.toLowerCase();
                if (currentAddress !== savedAddress) {
                  console.log("[Wallet] MetaMask account differs from saved, updating...");
                  setWalletAddress(accounts[0]);
                }
              }
            } catch (e) {
              console.log("[Wallet] Could not verify MetaMask connection:", e);
            }
          }
        }
      } catch (error) {
        console.error("[Wallet] Error loading wallet:", error);
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
      console.log("[Wallet] Saving wallet to database:", address);
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
      console.log("[Wallet] Wallet saved successfully");
    } catch (error) {
      console.error("[Wallet] Error saving wallet:", error);
    }
  }, [user]);

  // Remove wallet from database
  const removeWallet = useCallback(async () => {
    if (!user) return;

    try {
      console.log("[Wallet] Removing wallet from database");
      const { error } = await supabase
        .from("user_wallets")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;
      console.log("[Wallet] Wallet removed successfully");
    } catch (error) {
      console.error("[Wallet] Error removing wallet:", error);
    }
  }, [user]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    console.log("[Wallet] Starting wallet connection...");
    
    if (typeof window.ethereum === "undefined") {
      console.log("[Wallet] MetaMask not detected");
      toast.error("Vui lòng cài đặt MetaMask để kết nối blockchain", {
        action: {
          label: "Cài đặt",
          onClick: () => window.open("https://metamask.io/download/", "_blank"),
        },
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      console.log("[Wallet] Requesting accounts from MetaMask...");
      
      // First check if already connected
      const existingAccounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      
      let accounts = existingAccounts;
      
      // If no existing accounts, request connection
      if (!existingAccounts || existingAccounts.length === 0) {
        console.log("[Wallet] No existing accounts, requesting connection...");
        accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
      }
      
      console.log("[Wallet] Received accounts:", accounts);
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        console.log("[Wallet] Setting wallet address:", address);
        setWalletAddress(address);
        
        if (user) {
          await saveWallet(address);
          toast.success("🔗 Đã kết nối và lưu địa chỉ ví thành công!", {
            description: `${address.slice(0, 8)}...${address.slice(-6)}`,
          });
        } else {
          toast.success("🔗 Đã kết nối ví!", {
            description: "Đăng nhập để lưu địa chỉ ví của bạn.",
          });
        }
      } else {
        console.log("[Wallet] No accounts returned");
        toast.error("Không tìm thấy tài khoản ví nào");
      }
    } catch (error: unknown) {
      console.error("[Wallet] Connection error:", error);
      
      const err = error as { code?: number; message?: string };
      
      if (err.code === 4001) {
        toast.error("Bạn đã từ chối kết nối ví");
      } else if (err.code === -32002) {
        toast.error("Vui lòng mở MetaMask và chấp nhận yêu cầu kết nối", {
          description: "Có thể popup MetaMask đang chờ phản hồi",
        });
      } else {
        toast.error("Không thể kết nối ví", {
          description: err.message || "Vui lòng thử lại",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  }, [user, saveWallet]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    console.log("[Wallet] Disconnecting wallet...");
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
