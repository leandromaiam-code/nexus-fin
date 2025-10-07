-- Adicionar política RLS para permitir que membros da família vejam perfis uns dos outros
CREATE POLICY "Membros da família podem ver perfis uns dos outros"
ON public.users
FOR SELECT
USING (
  -- Permite ver seu próprio perfil
  auth_id = auth.uid()
  OR
  -- OU permite ver perfis de membros da mesma família
  id IN (
    SELECT mf.user_id
    FROM membros_familia mf
    WHERE mf.familia_id IN (
      SELECT familia_id 
      FROM membros_familia 
      WHERE user_id = get_current_user_id()
    )
  )
);