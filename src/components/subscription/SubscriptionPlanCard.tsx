import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard } from 'lucide-react';
import { Subscription } from '@/hooks/useSubscription';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SubscriptionPlanCardProps {
  subscription: Subscription | null;
  isLoading: boolean;
}

const planDetails = {
  free: { name: 'Gratuito', price: 'R$ 0', color: 'bg-secondary' },
  plus: { name: 'Plus', price: 'R$ 29,90/mês', color: 'bg-primary' },
  premium: { name: 'Premium', price: 'R$ 49,90/mês', color: 'bg-gradient-to-r from-primary to-accent' },
};

const statusLabels = {
  active: { label: 'Ativo', variant: 'default' as const },
  canceled: { label: 'Cancelado', variant: 'destructive' as const },
  past_due: { label: 'Vencido', variant: 'destructive' as const },
  trialing: { label: 'Trial', variant: 'secondary' as const },
  incomplete: { label: 'Incompleto', variant: 'secondary' as const },
};

export const SubscriptionPlanCard = ({ subscription, isLoading }: SubscriptionPlanCardProps) => {
  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </Card>
    );
  }

  const planType = subscription?.plan_type || 'free';
  const plan = planDetails[planType];
  const status = statusLabels[subscription?.status || 'active'];

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="text-3xl font-bold text-primary">{plan.price}</p>
        </div>
      </div>

      {subscription?.current_period_end && (
        <div className="space-y-3 mt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">
              {subscription.cancel_at_period_end 
                ? 'Cancela em: ' 
                : 'Próxima cobrança: '}
              {format(new Date(subscription.current_period_end), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>

          {subscription.cancel_at_period_end && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              Sua assinatura será cancelada ao final do período atual. Você continuará com acesso até {format(new Date(subscription.current_period_end), 'dd/MM/yyyy', { locale: ptBR })}.
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
