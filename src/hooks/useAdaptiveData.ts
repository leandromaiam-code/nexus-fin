import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useViewMode } from '@/contexts/ViewModeContext';

// Hook adaptativo para Dashboard
export const useAdaptiveDashboard = (month?: string) => {
  const { user } = useAuth();
  const { viewMode, familyId } = useViewMode();

  return useQuery({
    queryKey: ['adaptive-dashboard', viewMode, familyId, month],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      const selectedMonth = month || new Date().toISOString().slice(0, 10).replace(/(\d{4})-(\d{2})-\d{2}/, '$1-$2-01');

      if (viewMode === 'family' && familyId) {
        // Buscar todos os membros da família
        const { data: members, error: membersError } = await supabase
          .from('membros_familia')
          .select('user_id')
          .eq('familia_id', familyId);

        if (membersError) throw membersError;

        const userIds = members.map(m => m.user_id);

        // Buscar dados mensais de todos os membros
        const { data: summaries, error } = await supabase
          .from('monthly_summaries')
          .select('*')
          .in('user_id', userIds)
          .eq('month', selectedMonth);

        if (error) throw error;

        // Agregar dados da família
        const aggregated = summaries.reduce((acc, curr) => ({
          total_income: (acc.total_income || 0) + (curr.total_income || 0),
          total_spent: (acc.total_spent || 0) + (curr.total_spent || 0),
          balance: (acc.balance || 0) + (curr.balance || 0),
          renda_base_amount: (acc.renda_base_amount || 0) + (curr.renda_base_amount || 0),
        }), { total_income: 0, total_spent: 0, balance: 0, renda_base_amount: 0 });

        return { mode: 'family' as const, data: aggregated };
      } else {
        // Buscar dados individuais do mês selecionado
        const { data, error } = await supabase
          .from('monthly_summaries')
          .select('*')
          .eq('user_id', user.id)
          .eq('month', selectedMonth)
          .maybeSingle();

        if (error) throw error;
        
        // Se não houver dados para o mês, retornar zeros
        const monthlyData = data || {
          total_income: 0,
          total_spent: 0,
          balance: 0,
          renda_base_amount: 0
        };

        return { mode: 'individual' as const, data: monthlyData };
      }
    },
    enabled: !!user,
  });
};

// Hook adaptativo para Orçamento
export const useAdaptiveBudget = (month: string) => {
  const { user } = useAuth();
  const { viewMode, familyId } = useViewMode();

  return useQuery({
    queryKey: ['adaptive-budget', viewMode, familyId, month],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      if (viewMode === 'family' && familyId) {
        const { data, error } = await supabase
          .from('mv_family_budget_performance')
          .select('*')
          .eq('familia_id', familyId)
          .eq('month', month);

        if (error) throw error;
        return { mode: 'family' as const, data: data || [] };
      } else {
        const { data, error } = await supabase
          .from('budget_performance')
          .select('*')
          .eq('user_id', user.id)
          .eq('month', month);

        if (error) throw error;
        return { mode: 'individual' as const, data: data || [] };
      }
    },
    enabled: !!user && !!month,
  });
};

// Hook adaptativo para Metas
export const useAdaptiveGoals = () => {
  const { user } = useAuth();
  const { viewMode, familyId } = useViewMode();

  return useQuery({
    queryKey: ['adaptive-goals', viewMode, familyId],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      if (viewMode === 'family' && familyId) {
        const { data, error } = await supabase
          .from('mv_family_goals')
          .select('*')
          .eq('familia_id', familyId);

        if (error) throw error;
        return { mode: 'family' as const, data: data || [] };
      } else {
        const { data, error } = await supabase
          .from('user_goals')
          .select(`
            *,
            goal_templates (
              id,
              name,
              description
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (error) throw error;
        return { mode: 'individual' as const, data: data || [] };
      }
    },
    enabled: !!user,
  });
};

// Hook adaptativo para Transações
export const useAdaptiveTransactions = (limit: number = 100) => {
  const { user } = useAuth();
  const { viewMode, familyId } = useViewMode();

  return useQuery({
    queryKey: ['adaptive-transactions', viewMode, familyId, limit],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      if (viewMode === 'family' && familyId) {
        // Para família, buscar transações de todos os membros
        const { data: members, error: membersError } = await supabase
          .from('membros_familia')
          .select('user_id')
          .eq('familia_id', familyId);

        if (membersError) throw membersError;

        const userIds = members.map(m => m.user_id);

        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            categories (
              id,
              name,
              icon_name,
              tipo
            )
          `)
          .in('user_id', userIds)
          .order('transaction_date', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return { mode: 'family' as const, data: data || [] };
      } else {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            categories (
              id,
              name,
              icon_name,
              tipo
            )
          `)
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return { mode: 'individual' as const, data: data || [] };
      }
    },
    enabled: !!user,
  });
};

// Hook adaptativo para Análise de Gastos
export const useAdaptiveAnalytics = (month?: string) => {
  const { user } = useAuth();
  const { viewMode, familyId } = useViewMode();

  return useQuery({
    queryKey: ['adaptive-analytics', viewMode, familyId, month],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      // Convert month string to date range for querying
      const monthDate = month ? new Date(month) : new Date();
      const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString();
      const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1).toISOString();

      if (viewMode === 'family' && familyId) {
        // Para família, agregamos os dados de todos os membros
        const { data: members, error: membersError } = await supabase
          .from('membros_familia')
          .select('user_id')
          .eq('familia_id', familyId);

        if (membersError) throw membersError;

        const userIds = members.map(m => m.user_id);

        const { data, error } = await supabase
          .from('spending_trends_monthly')
          .select('*')
          .in('user_id', userIds)
          .gte('month', startOfMonth)
          .lt('month', endOfMonth);

        if (error) throw error;
        
        // Agregar por categoria
        const aggregated = data.reduce((acc: any[], item) => {
          const existing = acc.find(a => a.category_id === item.category_id);
          if (existing) {
            existing.total_spent += item.total_spent || 0;
            existing.transaction_count += item.transaction_count || 0;
          } else {
            acc.push({ ...item });
          }
          return acc;
        }, []);

        return { mode: 'family' as const, data: aggregated };
      } else {
        const { data, error } = await supabase
          .from('spending_trends_monthly')
          .select('*')
          .eq('user_id', user.id)
          .gte('month', startOfMonth)
          .lt('month', endOfMonth);

        if (error) throw error;
        return { mode: 'individual' as const, data: data || [] };
      }
    },
    enabled: !!user,
  });
};

// Hook adaptativo para Análise de Gastos por Categoria PAI
export const useAdaptiveAnalyticsByParent = (month?: string) => {
  const { user } = useAuth();
  const { viewMode, familyId } = useViewMode();

  return useQuery({
    queryKey: ['adaptive-analytics-parent', viewMode, familyId, month],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      // Convert month string to date range for querying
      const monthDate = month ? new Date(month) : new Date();
      const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString();
      const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1).toISOString();

      if (viewMode === 'family' && familyId) {
        // Para família, agregamos os dados de todos os membros
        const { data: members, error: membersError } = await supabase
          .from('membros_familia')
          .select('user_id')
          .eq('familia_id', familyId);

        if (membersError) throw membersError;

        const userIds = members.map(m => m.user_id);

        const { data, error } = await supabase
          .from('spending_trends_by_parent_category')
          .select('*')
          .in('user_id', userIds)
          .gte('month', startOfMonth)
          .lt('month', endOfMonth);

        if (error) throw error;
        
        // Agregar por categoria PAI
        const aggregated = data.reduce((acc: any[], item) => {
          const existing = acc.find(a => a.category_id === item.category_id);
          if (existing) {
            existing.total_spent += item.total_spent || 0;
            existing.transaction_count += item.transaction_count || 0;
          } else {
            acc.push({ ...item });
          }
          return acc;
        }, []);

        return { mode: 'family' as const, data: aggregated };
      } else {
        const { data, error } = await supabase
          .from('spending_trends_by_parent_category')
          .select('*')
          .eq('user_id', user.id)
          .gte('month', startOfMonth)
          .lt('month', endOfMonth);

        if (error) throw error;
        return { mode: 'individual' as const, data: data || [] };
      }
    },
    enabled: !!user,
  });
};
