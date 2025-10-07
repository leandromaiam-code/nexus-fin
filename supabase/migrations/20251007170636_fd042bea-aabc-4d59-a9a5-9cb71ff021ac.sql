-- Criar tabela de convites da família
CREATE TABLE public.family_invites (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  familia_id BIGINT NOT NULL REFERENCES public.familias(id) ON DELETE CASCADE,
  invited_by_user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  papel TEXT NOT NULL CHECK (papel IN ('Cônjuge', 'Dependente')),
  cota_mensal NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_by_user_id BIGINT REFERENCES public.users(id),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Criar índices para performance
CREATE INDEX idx_family_invites_token ON public.family_invites(token);
CREATE INDEX idx_family_invites_familia ON public.family_invites(familia_id);
CREATE INDEX idx_family_invites_status ON public.family_invites(status);

-- RLS Policies
ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;

-- Responsáveis podem criar convites para sua família
CREATE POLICY "criar_convite_familia"
ON public.family_invites
FOR INSERT
WITH CHECK (
  is_family_admin(get_current_user_id(), familia_id)
);

-- Responsáveis podem ver convites da sua família
CREATE POLICY "ver_convites_familia"
ON public.family_invites
FOR SELECT
USING (
  is_family_admin(get_current_user_id(), familia_id)
);

-- Qualquer pessoa autenticada pode ver convites pelo token (para aceitar)
CREATE POLICY "ver_convite_por_token"
ON public.family_invites
FOR SELECT
USING (
  auth.uid() IS NOT NULL
);

-- Responsáveis podem atualizar convites da sua família
CREATE POLICY "atualizar_convite_familia"
ON public.family_invites
FOR UPDATE
USING (
  is_family_admin(get_current_user_id(), familia_id)
);

-- Usuário pode atualizar convite que está aceitando
CREATE POLICY "aceitar_convite"
ON public.family_invites
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND status = 'pending'
);

-- Função para gerar token único
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$;