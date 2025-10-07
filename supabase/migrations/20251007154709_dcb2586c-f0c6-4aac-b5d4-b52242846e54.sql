-- Criar tabela de assinaturas
CREATE TABLE public.subscriptions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'plus', 'premium')) DEFAULT 'free',
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')) DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices para performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- RLS Policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários veem apenas suas assinaturas"
  ON public.subscriptions FOR SELECT
  USING (user_id = get_current_user_id());

CREATE POLICY "Usuários podem inserir suas assinaturas"
  ON public.subscriptions FOR INSERT
  WITH CHECK (user_id = get_current_user_id());

CREATE POLICY "Sistema pode gerenciar assinaturas"
  ON public.subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_subscription_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscription_updated_at();

-- Inserir assinatura gratuita para usuários existentes
INSERT INTO public.subscriptions (user_id, plan_type, status)
SELECT id, 'free', 'active'
FROM public.users
WHERE id NOT IN (SELECT user_id FROM public.subscriptions);