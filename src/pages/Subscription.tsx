import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import BackButton from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SubscriptionPlanCard } from '@/components/subscription/SubscriptionPlanCard';
import { PaymentMethodCard } from '@/components/subscription/PaymentMethodCard';
import { InvoiceTable } from '@/components/subscription/InvoiceTable';
import { CancelSubscriptionDialog } from '@/components/subscription/CancelSubscriptionDialog';
import { Sparkles, ExternalLink, XCircle } from 'lucide-react';

const Subscription = () => {
  const navigate = useNavigate();
  const {
    subscription,
    isLoading,
    invoices = [],
    isLoadingInvoices,
    createBillingPortalSession,
    cancelSubscription,
    isCreatingPortal,
    isCanceling,
  } = useSubscription();

  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleManagePayment = () => {
    createBillingPortalSession();
  };

  const handleCancelSubscription = () => {
    cancelSubscription();
    setShowCancelDialog(false);
  };

  const canCancel = 
    subscription?.status === 'active' && 
    subscription?.plan_type !== 'free' &&
    !subscription?.cancel_at_period_end;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-2xl font-bold">Minha Assinatura</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie seu plano e pagamentos
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        {/* Plan Information */}
        <SubscriptionPlanCard subscription={subscription} isLoading={isLoading} />

        {/* Payment Method */}
        {subscription?.plan_type !== 'free' && (
          <PaymentMethodCard 
            onManagePayment={handleManagePayment}
            isLoading={isCreatingPortal}
          />
        )}

        {/* Invoice History */}
        {subscription?.plan_type !== 'free' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Histórico de Faturas</h3>
            <InvoiceTable invoices={invoices} isLoading={isLoadingInvoices} />
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
          <div className="grid gap-3">
            <Button
              onClick={() => navigate('/pricing')}
              variant="outline"
              className="w-full justify-start"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {subscription?.plan_type === 'free' ? 'Fazer Upgrade' : 'Alterar Plano'}
            </Button>

            {subscription?.plan_type !== 'free' && (
              <>
                <Button
                  onClick={handleManagePayment}
                  disabled={isCreatingPortal}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Gerenciar no Stripe
                </Button>

                {canCancel && (
                  <Button
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isCanceling}
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar Assinatura
                  </Button>
                )}
              </>
            )}
          </div>
        </Card>
      </main>

      <CancelSubscriptionDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelSubscription}
        isLoading={isCanceling}
      />
    </div>
  );
};

export default Subscription;
