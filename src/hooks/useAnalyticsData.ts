import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook para spending_trends_monthly
export const useSpendingTrends = (months = 6) => {
  return useQuery({
    queryKey: ['spending-trends', months],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - months);

      const { data, error } = await supabase
        .from('spending_trends_monthly')
        .select('*')
        .gte('month', monthsAgo.toISOString())
        .order('month', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

// Hook para budget_performance
export const useBudgetPerformance = (month: string) => {
  return useQuery({
    queryKey: ['budget-performance', month],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('budget_performance')
        .select('*')
        .eq('month', month);

      if (error) throw error;
      return data;
    },
  });
};

// Hook para account_balances_timeline
export const useAccountBalancesTimeline = (months = 12) => {
  return useQuery({
    queryKey: ['account-balances-timeline', months],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - months);

      const { data, error } = await supabase
        .from('account_balances_timeline')
        .select('*')
        .gte('month', monthsAgo.toISOString())
        .order('month', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

// Hook para expense_insights
export const useExpenseInsights = (month: string) => {
  return useQuery({
    queryKey: ['expense-insights', month],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('expense_insights')
        .select('*')
        .eq('month', month)
        .single();

      if (error) throw error;
      return data;
    },
  });
};
