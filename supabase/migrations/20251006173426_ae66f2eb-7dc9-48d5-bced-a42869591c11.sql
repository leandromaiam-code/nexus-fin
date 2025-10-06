-- Criar função SECURITY DEFINER para verificar se usuário é responsável da família
CREATE OR REPLACE FUNCTION public.is_family_admin(
  _user_id bigint,
  _familia_id bigint
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.membros_familia
    WHERE user_id = _user_id
      AND familia_id = _familia_id
      AND papel = 'Responsável'
  )
$$;

-- Criar função SECURITY DEFINER para verificar se família está vazia
CREATE OR REPLACE FUNCTION public.is_family_empty(
  _familia_id bigint
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.membros_familia
    WHERE familia_id = _familia_id
  )
$$;

-- Remover políticas antigas que causam recursão
DROP POLICY IF EXISTS "adicionar_membro" ON public.membros_familia;
DROP POLICY IF EXISTS "editar_membro" ON public.membros_familia;
DROP POLICY IF EXISTS "remover_membro" ON public.membros_familia;
DROP POLICY IF EXISTS "ver_membros_familia" ON public.membros_familia;

-- Criar nova política para VER membros (sem recursão)
CREATE POLICY "ver_membros_familia"
ON public.membros_familia FOR SELECT
TO authenticated
USING (
  public.is_family_admin(get_current_user_id(), familia_id)
  OR user_id = get_current_user_id()
);

-- Criar nova política para ADICIONAR membros (sem recursão)
-- Permite adicionar se for admin OU se a família estiver vazia (primeiro membro)
CREATE POLICY "adicionar_membro"
ON public.membros_familia FOR INSERT
TO authenticated
WITH CHECK (
  public.is_family_admin(get_current_user_id(), familia_id)
  OR public.is_family_empty(familia_id)
);

-- Criar nova política para EDITAR membros (sem recursão)
CREATE POLICY "editar_membro"
ON public.membros_familia FOR UPDATE
TO authenticated
USING (public.is_family_admin(get_current_user_id(), familia_id));

-- Criar nova política para REMOVER membros (sem recursão)
CREATE POLICY "remover_membro"
ON public.membros_familia FOR DELETE
TO authenticated
USING (public.is_family_admin(get_current_user_id(), familia_id));