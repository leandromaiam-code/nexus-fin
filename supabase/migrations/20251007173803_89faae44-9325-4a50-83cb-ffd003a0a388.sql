-- Criar função para verificar se o usuário é membro da família
CREATE OR REPLACE FUNCTION public.is_family_member(_user_id bigint, _familia_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.membros_familia
    WHERE user_id = _user_id
      AND familia_id = _familia_id
  )
$$;

-- Atualizar política para permitir que membros vejam todos os outros membros da mesma família
DROP POLICY IF EXISTS ver_membros_familia ON public.membros_familia;

CREATE POLICY ver_membros_familia ON public.membros_familia
FOR SELECT
TO authenticated
USING (is_family_member(get_current_user_id(), familia_id));