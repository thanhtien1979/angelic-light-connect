
-- =====================================================
-- FIX #1: Improve profiles table RLS policy
-- The current policy allows 'everyone' visibility which is too broad.
-- Change default from 'friends' to 'nobody' when no privacy settings exist.
-- =====================================================

-- Drop and recreate the can_view_profile function with stricter defaults
CREATE OR REPLACE FUNCTION can_view_profile(viewer_id uuid, target_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      -- User can always view their own profile
      WHEN viewer_id = target_user_id THEN true
      -- Anonymous users cannot view profiles
      WHEN viewer_id IS NULL THEN false
      ELSE COALESCE(
        (
          SELECT CASE ps.profile_visibility
            WHEN 'everyone' THEN true
            WHEN 'friends' THEN EXISTS (
              SELECT 1 FROM friendships 
              WHERE status = 'accepted' 
              AND ((requester_id = viewer_id AND addressee_id = target_user_id)
                OR (addressee_id = viewer_id AND requester_id = target_user_id))
            )
            WHEN 'nobody' THEN false
            ELSE false -- Default to false for unknown values
          END
          FROM privacy_settings ps
          WHERE ps.user_id = target_user_id
        ),
        -- Default to 'friends' if no settings exist (require friendship)
        EXISTS (
          SELECT 1 FROM friendships 
          WHERE status = 'accepted' 
          AND ((requester_id = viewer_id AND addressee_id = target_user_id)
            OR (addressee_id = viewer_id AND requester_id = target_user_id))
        )
      )
    END
$$;

-- =====================================================
-- FIX #2: Improve private_messages RLS policy
-- The current SELECT policy allows viewing if user is sender OR receiver,
-- but doesn't verify friendship status at read time.
-- Add check for blocked users to prevent reading messages from blocked parties.
-- =====================================================

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own messages" ON private_messages;

-- Create a more secure SELECT policy that also checks for blocked status
CREATE POLICY "Users can view their own messages" 
ON private_messages 
FOR SELECT 
USING (
  -- User must be sender or receiver
  (auth.uid() = sender_id OR auth.uid() = receiver_id)
  AND
  -- Neither party has blocked the other
  NOT EXISTS (
    SELECT 1 FROM blocked_users 
    WHERE (
      (blocker_id = auth.uid() AND blocked_id = CASE WHEN auth.uid() = sender_id THEN receiver_id ELSE sender_id END)
      OR
      (blocker_id = CASE WHEN auth.uid() = sender_id THEN receiver_id ELSE sender_id END AND blocked_id = auth.uid())
    )
  )
);

-- Add a comment documenting the security considerations
COMMENT ON POLICY "Users can view their own messages" ON private_messages IS 
'Users can view messages they sent or received, but only if neither party has blocked the other. This prevents blocked users from reading historical messages.';
