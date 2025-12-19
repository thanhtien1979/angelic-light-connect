-- Create credit_transactions table for transaction history
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'bonus', 'refund')),
  amount INTEGER NOT NULL,
  description TEXT,
  payment_method TEXT,
  payment_reference TEXT,
  package_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
ON public.credit_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own transactions (for usage tracking)
CREATE POLICY "Users can insert own transactions"
ON public.credit_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);

-- Create function to record credit usage and update balance
CREATE OR REPLACE FUNCTION public.record_credit_usage(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT 'Sử dụng credits'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id UUID;
  v_current_balance BIGINT;
BEGIN
  -- Get current balance
  SELECT total_coins INTO v_current_balance
  FROM public.user_camly_coins
  WHERE user_id = p_user_id;
  
  -- Check if enough balance
  IF v_current_balance IS NULL OR v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  -- Deduct from balance
  UPDATE public.user_camly_coins
  SET total_coins = total_coins - p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.credit_transactions (user_id, transaction_type, amount, description, status)
  VALUES (p_user_id, 'usage', -p_amount, p_description, 'completed')
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$;

-- Create function to add credits (for purchases/bonuses)
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT,
  p_payment_method TEXT DEFAULT NULL,
  p_payment_reference TEXT DEFAULT NULL,
  p_package_id TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction_id UUID;
BEGIN
  -- Add to balance (upsert)
  INSERT INTO public.user_camly_coins (user_id, total_coins, lifetime_coins)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_coins = user_camly_coins.total_coins + p_amount,
    lifetime_coins = user_camly_coins.lifetime_coins + p_amount,
    updated_at = now();
  
  -- Record transaction
  INSERT INTO public.credit_transactions (
    user_id, transaction_type, amount, description, 
    payment_method, payment_reference, package_id, status
  )
  VALUES (
    p_user_id, p_transaction_type, p_amount, p_description,
    p_payment_method, p_payment_reference, p_package_id, 'completed'
  )
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$;