import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Zap, Crown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PricingCard } from '@/components/pricing/PricingCard';
import { FeatureComparison } from '@/components/pricing/FeatureComparison';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// TODO: Substituir pelos Price IDs reais do Stripe Dashboard
const PRICE_IDS = {
  plus_monthly: 'price_PLACEHOLDER_plus_monthly',
  plus_yearly: 'price_PLACEHOLDER_plus_yearly',
  premium_monthly: 'price_PLACEHOLDER_premium_monthly',
  premium_yearly: 'price_PLACEHOLDER_premium_yearly',
};

export default function Pricing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { subscription, createCheckoutSession, isCreatingCheckout } = useSubscription();
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({
        title: 'Pagamento confirmado! 🎉',
        description: 'Bem-vindo ao seu novo plano. Aproveite!',
      });
      navigate('/pricing', { replace: true });
    }
    if (searchParams.get('canceled') === 'true') {
      toast({
        title: 'Pagamento cancelado',
        description: 'Você pode tentar novamente quando quiser.',
        variant: 'destructive',
      });
      navigate('/pricing', { replace: true });
    }
  }, [searchParams, navigate]);

  const handlePlanSelection = (planType: 'plus' | 'premium') => {
    if (!user) {
      navigate('/login');
      return;
    }

    const priceId = isAnnual
      ? PRICE_IDS[`${planType}_yearly`]
      : PRICE_IDS[`${planType}_monthly`];

    createCheckoutSession({ priceId, planType });
  };

  const currentPlan = subscription?.plan_type || 'free';

  return (
    <>
      <Helmet>
        <title>Planos e Preços | Gestão Financeira Inteligente</title>
        <meta
          name="description"
          content="Escolha o plano ideal para gerenciar suas finanças com IA. Planos a partir de R$ 19/mês com teste grátis."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-background to-accent/5 pb-20">
        {/* Hero Section */}
        <section className="pt-20 pb-12 text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-nexus bg-clip-text text-transparent mb-4">
            Escolha seu plano
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Gerencie suas finanças com inteligência artificial. Cancele quando quiser.
          </p>
        </section>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16 px-6">
          <Label htmlFor="billing-toggle" className={!isAnnual ? 'font-semibold' : ''}>
            Mensal
          </Label>
          <Switch
            id="billing-toggle"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <Label htmlFor="billing-toggle" className={isAnnual ? 'font-semibold' : ''}>
            Anual
            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              Economize 20%
            </span>
          </Label>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6 mb-20">
          {/* Free Plan */}
          <PricingCard
            name="Gratuito"
            price="R$ 0"
            description="Para começar"
            features={[
              'Até 2 contas bancárias',
              'Até 100 transações/mês',
              '10 categorizações IA/mês',
              'Relatórios básicos',
              'Suporte por email',
            ]}
            cta="Começar Grátis"
            variant="outline"
            onCtaClick={() => navigate('/register')}
            currentPlan={currentPlan === 'free'}
          />

          {/* Plus Plan */}
          <PricingCard
            name="Plus"
            price={isAnnual ? 'R$ 19' : 'R$ 24'}
            description="Para uso pessoal"
            features={[
              'Até 5 contas bancárias',
              'Transações ilimitadas',
              'Categorização IA ilimitada',
              'Análises avançadas',
              'Categorias personalizadas',
              'Exportar dados',
              'Alertas de orçamento',
            ]}
            cta="Iniciar Teste Grátis"
            variant="nexus"
            popular={true}
            onCtaClick={() => handlePlanSelection('plus')}
            isLoading={isCreatingCheckout}
            currentPlan={currentPlan === 'plus'}
          />

          {/* Premium Plan */}
          <PricingCard
            name="Premium"
            price={isAnnual ? 'R$ 39' : 'R$ 49'}
            description="Para famílias"
            features={[
              'Contas bancárias ilimitadas',
              'Transações ilimitadas',
              'Categorização IA ilimitada',
              'Análises avançadas',
              'Até 6 membros da família',
              'Gestão de cotas familiares',
              'Suporte prioritário',
              'Exportar dados',
            ]}
            cta="Contratar Premium"
            variant="secondary"
            onCtaClick={() => handlePlanSelection('premium')}
            isLoading={isCreatingCheckout}
            currentPlan={currentPlan === 'premium'}
          />
        </div>

        {/* Feature Comparison */}
        <FeatureComparison />

        {/* FAQ Section */}
        <section className="mt-20 max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h3>
              <p className="text-muted-foreground">
                Sim! Você pode cancelar seu plano a qualquer momento sem multas ou taxas adicionais.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Como funciona o teste grátis?</h3>
              <p className="text-muted-foreground">
                Você tem 7 dias de teste grátis em qualquer plano pago. Não cobramos nada até o final do período.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Posso trocar de plano depois?</h3>
              <p className="text-muted-foreground">
                Sim! Você pode fazer upgrade ou downgrade a qualquer momento. O valor é ajustado proporcionalmente.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Quais formas de pagamento aceitas?</h3>
              <p className="text-muted-foreground">
                Aceitamos cartões de crédito (Visa, Mastercard, Amex) através do Stripe.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
