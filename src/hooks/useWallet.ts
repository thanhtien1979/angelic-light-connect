import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import "@/types/ethereum.d.ts";

// Supported networks
export const NETWORKS = {
  "0x1": { name: "Ethereum", symbol: "ETH", shortName: "Mainnet" },
  "0xaa36a7": { name: "Sepolia", symbol: "ETH", shortName: "Sepolia" },
  "0x89": { name: "Polygon", symbol: "MATIC", shortName: "Polygon" },
  "0x13882": { name: "Polygon Amoy", symbol: "MATIC", shortName: "Amoy" },
  "0xa4b1": { name: "Arbitrum One", symbol: "ETH", shortName: "Arbitrum" },
  "0xa": { name: "Optimism", symbol: "ETH", shortName: "Optimism" },
} as const;

export type NetworkId = keyof typeof NETWORKS;

export const useWallet = () => {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState<string | null>(null);
  const [networkId, setNetworkId] = useState<string | null>(null);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const hasInitialized = useRef(false);

  // Get current network info
  const currentNetwork = networkId && networkId in NETWORKS 
    ? NETWORKS[networkId as NetworkId] 
    : null;

  // Fetch ETH balance
  const fetchBalance = useCallback(async (address: string) => {
    if (typeof window.ethereum === "undefined" || !address) return;
    
    try {
      const result = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      
      const balanceHex = Array.isArray(result) ? result[0] : result;
      
      // Convert from wei to ETH (18 decimals)
      const balanceWei = parseInt(balanceHex as string, 16);
      const balanceEth = balanceWei / 1e18;
      
      // Format to max 4 decimal places
      const formatted = balanceEth < 0.0001 && balanceEth > 0
        ? "< 0.0001"
        : balanceEth.toFixed(4).replace(/\.?0+$/, "");
      
      setBalance(formatted);
      console.log("[Wallet] Balance fetched:", formatted);
    } catch (error) {
      console.error("[Wallet] Error fetching balance:", error);
      setBalance(null);
    }
  }, []);

  // Fetch current network
  const fetchNetwork = useCallback(async () => {
    if (typeof window.ethereum === "undefined") return;
    
    try {
      const result = await window.ethereum.request({
        method: "eth_chainId",
      });
      
      const chainId = Array.isArray(result) ? result[0] : result;
      setNetworkId(chainId as string);
      console.log("[Wallet] Network fetched:", chainId);
    } catch (error) {
      console.error("[Wallet] Error fetching network:", error);
    }
  }, []);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId: NetworkId) => {
    if (typeof window.ethereum === "undefined") return;
    
    setIsSwitchingNetwork(true);
    
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainId }],
      });
      
      setNetworkId(targetChainId);
      toast.success(`Đã chuyển sang ${NETWORKS[targetChainId].name}`);
      
      // Refetch balance after network switch
      if (walletAddress) {
        await fetchBalance(walletAddress);
      }
    } catch (error: unknown) {
      const err = error as { code?: number };
      
      if (err.code === 4902) {
        toast.error("Mạng này chưa được thêm vào MetaMask", {
          description: "Vui lòng thêm mạng thủ công trong MetaMask",
        });
      } else if (err.code === 4001) {
        toast.error("Bạn đã từ chối chuyển mạng");
      } else {
        toast.error("Không thể chuyển mạng");
      }
    } finally {
      setIsSwitchingNetwork(false);
    }
  }, [walletAddress, fetchBalance]);

  // Handle account changes from MetaMask
  const handleAccountsChanged = useCallback((accounts: unknown[]) => {
    console.log("[Wallet] Accounts changed:", accounts);
    
    if (accounts.length === 0) {
      setWalletAddress(null);
      setBalance(null);
      toast.info("Ví đã ngắt kết nối từ MetaMask");
    } else {
      const newAddress = accounts[0] as string;
      if (newAddress !== walletAddress) {
        setWalletAddress(newAddress);
        fetchBalance(newAddress);
        toast.success("Đã chuyển sang tài khoản ví mới");
      }
    }
  }, [walletAddress, fetchBalance]);

  // Handle chain/network changes
  const handleChainChanged = useCallback((chainId: unknown) => {
    console.log("[Wallet] Chain changed:", chainId);
    setNetworkId(chainId as string);
    
    // Refetch balance on new chain
    if (walletAddress) {
      fetchBalance(walletAddress);
    }
  }, [walletAddress, fetchBalance]);

  // Setup MetaMask event listeners
  useEffect(() => {
    if (typeof window.ethereum === "undefined") return;

    const ethereum = window.ethereum;
    
    ethereum.on?.("accountsChanged", handleAccountsChanged);
    ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [handleAccountsChanged, handleChainChanged]);

  // Load saved wallet from database
  useEffect(() => {
    const loadSavedWallet = async () => {
      if (!user) {
        setWalletAddress(null);
        setBalance(null);
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
          
          // Fetch network and balance
          await fetchNetwork();
          await fetchBalance(data.wallet_address);
          
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
                  await fetchBalance(accounts[0]);
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
  }, [user, fetchBalance, fetchNetwork]);

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
      
      const existingAccounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      
      let accounts = existingAccounts;
      
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
        
        // Fetch network and balance
        await fetchNetwork();
        await fetchBalance(address);
        
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
  }, [user, saveWallet, fetchBalance, fetchNetwork]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    console.log("[Wallet] Disconnecting wallet...");
    setWalletAddress(null);
    setBalance(null);
    
    if (user) {
      await removeWallet();
    }
    
    toast.success("Đã ngắt kết nối ví");
  }, [user, removeWallet]);

  return {
    walletAddress,
    isConnecting,
    isLoading,
    balance,
    networkId,
    currentNetwork,
    isSwitchingNetwork,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    fetchBalance,
  };
};
