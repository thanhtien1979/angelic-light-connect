-- Create table for storing NFT minting history
CREATE TABLE public.nft_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  image_id uuid REFERENCES public.generated_images(id) ON DELETE SET NULL,
  wallet_address text NOT NULL,
  token_id text NOT NULL,
  transaction_hash text NOT NULL,
  blockchain text NOT NULL DEFAULT 'ethereum_sepolia',
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb,
  gas_fee numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  confirmed_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.nft_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own NFT transactions"
ON public.nft_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own NFT transactions"
ON public.nft_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own NFT transactions"
ON public.nft_transactions
FOR UPDATE
USING (auth.uid() = user_id);

-- Add is_minted column to generated_images
ALTER TABLE public.generated_images 
ADD COLUMN IF NOT EXISTS is_minted boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS token_id text;