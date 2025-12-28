-- Fix user_presence RLS policies - allow upsert
DROP POLICY IF EXISTS "Users can insert own presence" ON public.user_presence;
DROP POLICY IF EXISTS "Users can update own presence" ON public.user_presence;

-- Create new policy that allows both insert and update (upsert)
CREATE POLICY "Users can insert own presence" 
ON public.user_presence 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presence" 
ON public.user_presence 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix group_members RLS policies - remove infinite recursion
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can remove members" ON public.group_members;

-- Recreate policies without recursion
CREATE POLICY "Users can view group members" 
ON public.group_members 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() OR 
  group_id IN (
    SELECT gm.group_id FROM public.group_members gm WHERE gm.user_id = auth.uid()
  )
);

CREATE POLICY "Group admins can add members" 
ON public.group_members 
FOR INSERT 
TO authenticated
WITH CHECK (
  -- User is admin of this group
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.role = 'admin'
  )
  OR 
  -- User is creator of this group
  EXISTS (
    SELECT 1 FROM public.group_chats gc
    WHERE gc.id = group_members.group_id 
    AND gc.created_by = auth.uid()
  )
);

CREATE POLICY "Group admins can remove members" 
ON public.group_members 
FOR DELETE 
TO authenticated
USING (
  -- User is admin of this group
  EXISTS (
    SELECT 1 FROM public.group_members gm
    WHERE gm.group_id = group_members.group_id 
    AND gm.user_id = auth.uid() 
    AND gm.role = 'admin'
  )
  OR 
  -- User is removing themselves
  auth.uid() = user_id
);