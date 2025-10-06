-- Políticas RLS para tabela orcamentos
CREATE POLICY "usuarios_podem_ver_orcamentos"
ON public.orcamentos FOR SELECT
TO authenticated
USING (user_id = get_current_user_id());

CREATE POLICY "usuarios_podem_criar_orcamentos"
ON public.orcamentos FOR INSERT
TO authenticated
WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "usuarios_podem_editar_orcamentos"
ON public.orcamentos FOR UPDATE
TO authenticated
USING (user_id = get_current_user_id())
WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "usuarios_podem_deletar_orcamentos"
ON public.orcamentos FOR DELETE
TO authenticated
USING (user_id = get_current_user_id());

-- Políticas RLS para tabela desafios (leitura pública)
CREATE POLICY "todos_podem_ver_desafios"
ON public.desafios FOR SELECT
TO authenticated
USING (true);

-- Políticas RLS para tabela recompensas (usuários veem recompensas da sua família)
CREATE POLICY "usuarios_podem_ver_recompensas_familia"
ON public.recompensas FOR SELECT
TO authenticated
USING (familia_id IN (
  SELECT familia_id FROM membros_familia 
  WHERE user_id = get_current_user_id()
));

-- Políticas RLS para tabela progresso_desafios_usuario
CREATE POLICY "usuarios_gerenciam_proprio_progresso"
ON public.progresso_desafios_usuario FOR ALL
TO authenticated
USING (user_id = get_current_user_id())
WITH CHECK (user_id = get_current_user_id());

-- Políticas RLS para tabela recompensas_resgatadas
CREATE POLICY "usuarios_veem_recompensas_resgatadas"
ON public.recompensas_resgatadas FOR ALL
TO authenticated
USING (user_id = get_current_user_id())
WITH CHECK (user_id = get_current_user_id());