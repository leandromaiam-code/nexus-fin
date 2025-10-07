-- Corrigir política RLS para aceitar convites
DROP POLICY IF EXISTS "aceitar_convite" ON public.family_invites;

CREATE POLICY "aceitar_convite" 
ON public.family_invites
FOR UPDATE
USING (
  auth.uid() IS NOT NULL 
  AND status = 'pending'
  AND expires_at > now()
)
WITH CHECK (
  status = 'accepted' 
  AND accepted_by_user_id = get_current_user_id()
  AND accepted_at IS NOT NULL
);