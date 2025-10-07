import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export type PlanType = 'free' | 'plus' | 'premium';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';

export interface Subscription {
  id: number;
  user_id: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan_type: PlanType;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  date: number;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
  description: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<Subscription | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data as Subscription | null;
    },
    enabled: !!user?.id,
  });

  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices', user?.id],
    queryFn: async (): Promise<Invoice[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase.functions.invoke('get-customer-invoices');

      if (error) {
        console.error('Error fetching invoices:', error);
        return [];
      }

      return data?.invoices || [];
    },
    enabled: !!user?.id && !!subscription?.stripe_customer_id,
  });

  const createCheckoutSession = useMutation({
    mutationFn: async ({ priceId, planType }: { priceId: string; planType: PlanType }) => {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId, planType },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');

      return data.url;
    },
    onSuccess: (url: string) => {
      window.location.href = url;
    },
    onError: (error: Error) => {
      console.error('Checkout error:', error);
      toast({
        title: 'Erro ao criar sessão',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    },
  });

  const createBillingPortalSession = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-billing-portal-session');

      if (error) throw error;
      if (!data?.url) throw new Error('No portal URL returned');

      return data.url;
    },
    onSuccess: (url: string) => {
      window.location.href = url;
    },
    onError: (error: Error) => {
      console.error('Billing portal error:', error);
      toast({
        title: 'Erro ao abrir portal',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('cancel-subscription');

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
      toast({
        title: 'Assinatura cancelada',
        description: 'Você continuará com acesso até o final do período pago.',
      });
    },
    onError: (error: Error) => {
      console.error('Cancel subscription error:', error);
      toast({
        title: 'Erro ao cancelar assinatura',
        description: error.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    },
  });

  const isPremium = subscription?.plan_type === 'premium' && subscription?.status === 'active';
  const isPlus = subscription?.plan_type === 'plus' && subscription?.status === 'active';
  const isFree = !subscription || subscription?.plan_type === 'free';

  return {
    subscription,
    isLoading,
    isPremium,
    isPlus,
    isFree,
    invoices,
    isLoadingInvoices,
    createCheckoutSession: createCheckoutSession.mutate,
    createBillingPortalSession: createBillingPortalSession.mutate,
    cancelSubscription: cancelSubscription.mutate,
    isCreatingCheckout: createCheckoutSession.isPending,
    isCreatingPortal: createBillingPortalSession.isPending,
    isCanceling: cancelSubscription.isPending,
  };
};
