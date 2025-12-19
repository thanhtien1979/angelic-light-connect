import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface NFTTransaction {
  id: string;
  image_id: string | null;
  wallet_address: string;
  token_id: string;
  transaction_hash: string;
  blockchain: string;
  status: string;
  metadata: Record<string, unknown> | null;
  gas_fee: number | null;
  created_at: string;
  confirmed_at: string | null;
}

export const useNFT = () => {
  const { user } = useAuth();
  const [isMinting, setIsMinting] = useState(false);
  const [transactions, setTransactions] = useState<NFTTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // Generate mock transaction hash
  const generateTransactionHash = () => {
    const chars = "0123456789abcdef";
    let hash = "0x";
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  // Generate mock token ID
  const generateTokenId = () => {
    return Math.floor(Math.random() * 1000000).toString();
  };

  // Mint NFT (simulated)
  const mintNFT = useCallback(async (
    imageId: string,
    imageUrl: string,
    prompt: string,
    walletAddress: string
  ) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để mint NFT");
      return null;
    }

    if (!walletAddress) {
      toast.error("Vui lòng kết nối ví trước khi mint");
      return null;
    }

    setIsMinting(true);
    
    try {
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const tokenId = generateTokenId();
      const transactionHash = generateTransactionHash();
      const gasFee = (Math.random() * 0.01 + 0.001).toFixed(6);

      // Insert NFT transaction
      const { data: txData, error: txError } = await supabase
        .from("nft_transactions")
        .insert({
          user_id: user.id,
          image_id: imageId,
          wallet_address: walletAddress,
          token_id: tokenId,
          transaction_hash: transactionHash,
          blockchain: "ethereum_sepolia",
          status: "confirmed",
          gas_fee: parseFloat(gasFee),
          confirmed_at: new Date().toISOString(),
          metadata: {
            name: `Angel Art #${tokenId}`,
            description: prompt,
            image: imageUrl,
            attributes: [
              { trait_type: "Creator", value: walletAddress.slice(0, 8) + "..." },
              { trait_type: "Created", value: new Date().toLocaleDateString() }
            ]
          }
        })
        .select()
        .single();

      if (txError) throw txError;

      // Update generated_images to mark as minted
      await supabase
        .from("generated_images")
        .update({ is_minted: true, token_id: tokenId })
        .eq("id", imageId);

      toast.success(`NFT minted thành công! Token ID: #${tokenId}`);
      
      return txData;
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error("Không thể mint NFT. Vui lòng thử lại.");
      return null;
    } finally {
      setIsMinting(false);
    }
  }, [user]);

  // Fetch transaction history
  const fetchTransactions = useCallback(async () => {
    if (!user) return;

    setIsLoadingTransactions(true);
    try {
      const { data, error } = await supabase
        .from("nft_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setTransactions((data as NFTTransaction[]) || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [user]);

  return {
    isMinting,
    transactions,
    isLoadingTransactions,
    mintNFT,
    fetchTransactions,
  };
};
