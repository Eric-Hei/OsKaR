-- ============================================================================
-- Migration: Fix Security Lint Errors
-- Date: 2026-02-11
-- ============================================================================

-- 1. Functions to check team membership without recursion (SECURITY DEFINER)
-- These functions run with higher privileges to avoid the RLS "circular dependancy" 
-- where checking if a user is in a team requires checking if they are in the team.

CREATE OR REPLACE FUNCTION public.check_is_team_member(t_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = t_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.check_is_team_admin(t_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = t_id
    AND user_id = auth.uid()
    AND role IN ('OWNER', 'ADMIN')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Re-enable RLS on team_members
-- It was previously disabled to avoid infinite recursion.
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 3. Update team_members policies to avoid recursion
DROP POLICY IF EXISTS "Team members can view team members" ON public.team_members;
CREATE POLICY "Team members can view team members"
  ON public.team_members FOR SELECT
  USING (public.check_is_team_member(team_id));

DROP POLICY IF EXISTS "Team admins can manage members" ON public.team_members;
CREATE POLICY "Team admins can manage members"
  ON public.team_members FOR ALL
  USING (public.check_is_team_admin(team_id));

DROP POLICY IF EXISTS "Users can delete own team memberships" ON public.team_members;
CREATE POLICY "Users can delete own team memberships"
  ON public.team_members FOR DELETE
  USING (user_id = auth.uid());

-- 4. Set security_invoker for views
-- This ensures that RLS policies of the tables used in the view are enforced 
-- for the user querying the view.
ALTER VIEW public.ambitions_with_progress SET (security_invoker = true);
ALTER VIEW public.quarterly_objectives_with_progress SET (security_invoker = true);

-- 5. Revoke/Grant permissions for the security definer functions
-- Ensure they can only be used by authenticated users.
REVOKE EXECUTE ON FUNCTION public.check_is_team_member(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.check_is_team_member(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.check_is_team_admin(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.check_is_team_admin(uuid) TO authenticated;
