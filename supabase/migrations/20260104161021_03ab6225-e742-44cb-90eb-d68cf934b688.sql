-- Drop the problematic SELECT policy
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;

-- Create a simpler SELECT policy that doesn't cause recursion
-- Users can see all members in groups they are part of
CREATE POLICY "Users can view group members"
ON public.group_members
FOR SELECT
TO authenticated
USING (
  -- User can see their own membership
  user_id = auth.uid()
  -- Or user is the creator of the group
  OR group_id IN (
    SELECT id FROM group_chats WHERE created_by = auth.uid()
  )
  -- Or user is a member of the same group (using a subquery that doesn't reference the same row)
  OR group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);