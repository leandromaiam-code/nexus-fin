-- Adicionar coluna responsavel_user_id na tabela familias
ALTER TABLE public.familias 
ADD COLUMN responsavel_user_id bigint REFERENCES public.users(id);

-- Popular com os dados existentes (responsáveis atuais)
UPDATE public.familias f
SET responsavel_user_id = (
  SELECT mf.user_id 
  FROM public.membros_familia mf 
  WHERE mf.familia_id = f.id 
    AND mf.papel = 'Responsável' 
  LIMIT 1
);

-- Tornar NOT NULL depois de popular
ALTER TABLE public.familias 
ALTER COLUMN responsavel_user_id SET NOT NULL;

-- Criar função para verificar convite válido
CREATE OR REPLACE FUNCTION public.has_valid_invite(_user_id bigint, _familia_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.family_invites
    WHERE familia_id = _familia_id
      AND status = 'pending'
      AND expires_at > now()
      AND accepted_by_user_id IS NULL
  )
$$;

-- Atualizar política de INSERT em membros_familia
DROP POLICY IF EXISTS adicionar_membro ON public.membros_familia;

CREATE POLICY adicionar_membro ON public.membros_familia
FOR INSERT
TO authenticated
WITH CHECK (
  is_family_admin(get_current_user_id(), familia_id) 
  OR is_family_empty(familia_id)
  OR has_valid_invite(get_current_user_id(), familia_id)
);