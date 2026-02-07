-- Create enum for coin types
CREATE TYPE public.coin_type AS ENUM ('camly_coin', 'fun_money', 'bnb', 'usdt');

-- Create table for user-to-user gift transactions
CREATE TABLE public.gift_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
  coin_type public.coin_type NOT NULL DEFAULT 'camly_coin',
  message TEXT,
  post_id UUID, -- optional reference if gift is from a post
  bsc_tx_hash TEXT, -- if on-chain transaction
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  light_score_points INTEGER DEFAULT 0, -- points awarded
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent self-gifting
  CONSTRAINT no_self_gift CHECK (sender_id != receiver_id)
);

-- Enable RLS
ALTER TABLE public.gift_transactions ENABLE ROW LEVEL SECURITY;

-- Policies: Users can view their own transactions (sent or received)
CREATE POLICY "Users can view own gift transactions"
ON public.gift_transactions
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy: Authenticated users can create gift transactions
CREATE POLICY "Authenticated users can send gifts"
ON public.gift_transactions
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Create index for faster queries
CREATE INDEX idx_gift_transactions_sender ON public.gift_transactions(sender_id);
CREATE INDEX idx_gift_transactions_receiver ON public.gift_transactions(receiver_id);
CREATE INDEX idx_gift_transactions_created_at ON public.gift_transactions(created_at DESC);

-- Create view for top sponsors leaderboard (public read)
CREATE OR REPLACE VIEW public.top_sponsors AS
SELECT 
  gt.sender_id,
  p.display_name,
  p.avatar_url,
  COUNT(*) as total_gifts,
  SUM(gt.amount) as total_amount,
  gt.coin_type
FROM public.gift_transactions gt
LEFT JOIN public.profiles p ON gt.sender_id = p.id
WHERE gt.status = 'completed'
GROUP BY gt.sender_id, p.display_name, p.avatar_url, gt.coin_type
ORDER BY total_amount DESC;

-- Grant access to the view
GRANT SELECT ON public.top_sponsors TO anon, authenticated;

-- Enable realtime for gift_transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_transactions;

-- Create function to award Light Score points when gifting
CREATE OR REPLACE FUNCTION public.award_gift_light_score()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award INTEGER;
BEGIN
  -- Calculate points: 1 point per 100 coins, minimum 1 point
  points_to_award := GREATEST(1, FLOOR(NEW.amount / 100));
  
  -- Update the transaction with points
  NEW.light_score_points := points_to_award;
  
  -- Award points to sender via reward ledger if user has camly coins
  INSERT INTO public.reward_ledger (user_id, amount, reward_type, description, created_by, balance_after, is_admin_action)
  SELECT 
    NEW.sender_id,
    points_to_award,
    'gift_giving',
    'Thưởng Light Score khi tặng ' || NEW.amount || ' ' || NEW.coin_type || ' cho bạn bè',
    NEW.sender_id,
    COALESCE((SELECT total_coins FROM public.user_camly_coins WHERE user_id = NEW.sender_id), 0) + points_to_award,
    false
  WHERE EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.sender_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER trigger_award_gift_light_score
  BEFORE INSERT ON public.gift_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.award_gift_light_score();

-- Create notification when receiving gift
CREATE OR REPLACE FUNCTION public.notify_gift_received()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, actor_id, reference_id)
  VALUES (
    NEW.receiver_id,
    'gift_received',
    '🎁 Bạn nhận được quà tặng!',
    'Bạn vừa nhận được ' || NEW.amount || ' ' || 
    CASE NEW.coin_type 
      WHEN 'camly_coin' THEN 'CAMLY COIN'
      WHEN 'fun_money' THEN 'FUN MONEY'
      WHEN 'bnb' THEN 'BNB'
      WHEN 'usdt' THEN 'USDT'
    END ||
    CASE WHEN NEW.message IS NOT NULL AND NEW.message != '' 
      THEN ': "' || LEFT(NEW.message, 100) || '"'
      ELSE ''
    END,
    NEW.sender_id,
    NEW.id::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_gift_received
  AFTER INSERT ON public.gift_transactions
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.notify_gift_received();