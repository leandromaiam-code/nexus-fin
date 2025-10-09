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

// Hook para histórico de orçamento vs realizado (ano atual)
export const useBudgetHistory = () => {
  return useQuery({
    queryKey: ['budget-history'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const currentYear = new Date().getFullYear();
      const startOfYear = `${currentYear}-01-01`;
      const endOfYear = `${currentYear}-12-31`;

      // Buscar orçamentos do ano
      const { data: budgets, error: budgetError } = await supabase
        .from('orcamentos')
        .select('mes_ano, valor_orcado')
        .gte('mes_ano', startOfYear)
        .lte('mes_ano', endOfYear);

      if (budgetError) throw budgetError;

      // Buscar gastos reais do ano (excluindo receitas)
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('transaction_date, amount, categories(tipo)')
        .gte('transaction_date', startOfYear)
        .lte('transaction_date', endOfYear);

      if (transError) throw transError;

      // Agrupar por mês
      const monthlyData: { [key: string]: { budgeted: number; spent: number } } = {};

      budgets?.forEach((b) => {
        const month = b.mes_ano.substring(0, 7); // "2025-10"
        if (!monthlyData[month]) monthlyData[month] = { budgeted: 0, spent: 0 };
        monthlyData[month].budgeted += Number(b.valor_orcado);
      });

      transactions?.forEach((t: any) => {
        // Excluir receitas (tipo 'Receita')
        if (t.categories?.tipo === 'Receita') return;
        
        const month = t.transaction_date.substring(0, 7);
        if (!monthlyData[month]) monthlyData[month] = { budgeted: 0, spent: 0 };
        monthlyData[month].spent += Math.abs(Number(t.amount));
      });

      // Converter para array ordenado
      return Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          budgeted: data.budgeted,
          spent: data.spent,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
    },
  });
};
