-- Drop the view and recreate without SECURITY DEFINER
DROP VIEW IF EXISTS public.top_sponsors;

-- Create view for top sponsors leaderboard (without SECURITY DEFINER - uses invoker permissions)
CREATE VIEW public.top_sponsors 
WITH (security_invoker = true)
AS
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

-- Add policy for public to view gift transactions in leaderboard context
CREATE POLICY "Anyone can view completed gifts for leaderboard"
ON public.gift_transactions
FOR SELECT
USING (status = 'completed');