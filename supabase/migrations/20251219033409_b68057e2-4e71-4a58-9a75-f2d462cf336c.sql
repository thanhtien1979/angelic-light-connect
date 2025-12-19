-- Create table for storing user wallet addresses
CREATE TABLE public.user_wallets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  wallet_address text NOT NULL,
  wallet_type text NOT NULL DEFAULT 'metamask',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own wallet"
ON public.user_wallets
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet"
ON public.user_wallets
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
ON public.user_wallets
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallet"
ON public.user_wallets
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_user_wallets_updated_at
BEFORE UPDATE ON public.user_wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();