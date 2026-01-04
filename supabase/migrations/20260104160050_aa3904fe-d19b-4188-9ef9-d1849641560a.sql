-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can remove members" ON public.group_members;
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;

-- Recreate policies without self-referencing subqueries
-- For SELECT: Users can view members of groups they belong to
CREATE POLICY "Users can view group members"
ON public.group_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.group_chats gc
    WHERE gc.id = group_members.group_id
    AND gc.created_by = auth.uid()
  )
);

-- For INSERT: Only group creators or existing admins (checked via function)
CREATE OR REPLACE FUNCTION public.is_group_admin(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id 
    AND user_id = auth.uid() 
    AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM group_chats
    WHERE id = p_group_id 
    AND created_by = auth.uid()
  );
$$;

CREATE POLICY "Group admins can add members"
ON public.group_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_group_admin(group_id)
);

-- For DELETE: Admins can remove members, users can remove themselves
CREATE POLICY "Group admins can remove members"
ON public.group_members
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.is_group_admin(group_id)
);