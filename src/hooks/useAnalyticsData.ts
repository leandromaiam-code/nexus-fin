import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useViewMode } from '@/contexts/ViewModeContext';

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

// Hook para histórico de orçamento vs realizado (ano atual) - Adaptativo
export const useBudgetHistory = () => {
  const { user } = useAuth();
  const { viewMode, familyId } = useViewMode();
  
  return useQuery({
    queryKey: ['budget-history', viewMode, familyId],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const currentYear = new Date().getFullYear();
      const startOfYear = `${currentYear}-01-01`;
      const endOfYear = `${currentYear}-12-31`;

      if (viewMode === 'family' && familyId) {
        // VISÃO FAMÍLIA: Buscar dados agregados de todos os membros
        
        // 1. Buscar IDs dos membros da família
        const { data: members } = await supabase
          .from('membros_familia')
          .select('user_id')
          .eq('familia_id', familyId);

        const userIds = members?.map(m => m.user_id) || [];

        if (userIds.length === 0) {
          return [];
        }

        // 2. Buscar orçamentos (individuais ou da família)
        const { data: budgets, error: budgetError } = await supabase
          .from('orcamentos')
          .select('mes_ano, valor_orcado')
          .or(`user_id.in.(${userIds.join(',')}),familia_id.eq.${familyId}`)
          .gte('mes_ano', startOfYear)
          .lte('mes_ano', endOfYear);

        if (budgetError) throw budgetError;

        // 3. Buscar transações de todos os membros (excluindo receitas)
        const { data: transactions, error: transError } = await supabase
          .from('transactions')
          .select('transaction_date, amount, categories(tipo)')
          .in('user_id', userIds)
          .gte('transaction_date', startOfYear)
          .lte('transaction_date', endOfYear);

        if (transError) throw transError;

        // Agrupar por mês
        const monthlyData: { [key: string]: { budgeted: number; spent: number } } = {};

        budgets?.forEach((b) => {
          const month = b.mes_ano.substring(0, 7);
          if (!monthlyData[month]) monthlyData[month] = { budgeted: 0, spent: 0 };
          monthlyData[month].budgeted += Number(b.valor_orcado);
        });

        transactions?.forEach((t: any) => {
          if (t.categories?.tipo !== 'Receita') {
            const month = t.transaction_date.substring(0, 7);
            if (!monthlyData[month]) monthlyData[month] = { budgeted: 0, spent: 0 };
            monthlyData[month].spent += Math.abs(Number(t.amount));
          }
        });

        return Object.entries(monthlyData)
          .map(([month, data]) => ({
            month,
            budgeted: data.budgeted,
            spent: data.spent,
          }))
          .sort((a, b) => a.month.localeCompare(b.month));

      } else {
        // VISÃO INDIVIDUAL: Buscar dados do usuário logado
        
        const { data: budgets, error: budgetError } = await supabase
          .from('orcamentos')
          .select('mes_ano, valor_orcado')
          .eq('user_id', user.id)
          .gte('mes_ano', startOfYear)
          .lte('mes_ano', endOfYear);

        if (budgetError) throw budgetError;

        const { data: transactions, error: transError } = await supabase
          .from('transactions')
          .select('transaction_date, amount, categories(tipo)')
          .eq('user_id', user.id)
          .gte('transaction_date', startOfYear)
          .lte('transaction_date', endOfYear);

        if (transError) throw transError;

        const monthlyData: { [key: string]: { budgeted: number; spent: number } } = {};

        budgets?.forEach((b) => {
          const month = b.mes_ano.substring(0, 7);
          if (!monthlyData[month]) monthlyData[month] = { budgeted: 0, spent: 0 };
          monthlyData[month].budgeted += Number(b.valor_orcado);
        });

        transactions?.forEach((t: any) => {
          if (t.categories?.tipo !== 'Receita') {
            const month = t.transaction_date.substring(0, 7);
            if (!monthlyData[month]) monthlyData[month] = { budgeted: 0, spent: 0 };
            monthlyData[month].spent += Math.abs(Number(t.amount));
          }
        });

        return Object.entries(monthlyData)
          .map(([month, data]) => ({
            month,
            budgeted: data.budgeted,
            spent: data.spent,
          }))
          .sort((a, b) => a.month.localeCompare(b.month));
      }
    },
  });
};
