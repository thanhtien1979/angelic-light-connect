-- Fix infinite recursion in RLS policy for public.group_members
-- by removing self-referential subqueries and using SECURITY DEFINER helpers.

-- Ensure RLS is enabled
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Helper: check whether a user created a group
CREATE OR REPLACE FUNCTION public.is_group_creator(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_chats gc
    WHERE gc.id = _group_id
      AND gc.created_by = _user_id
  );
$$;

-- Helper: check whether a user is a member of a group
-- NOTE: SECURITY DEFINER makes this bypass RLS on group_members, preventing recursion.
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.group_members gm
    WHERE gm.group_id = _group_id
      AND gm.user_id = _user_id
  );
$$;

-- Replace the problematic policy
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;

CREATE POLICY "Users can view group members"
ON public.group_members
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.is_group_creator(auth.uid(), group_id)
  OR public.is_group_member(auth.uid(), group_id)
);
