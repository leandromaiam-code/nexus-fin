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

      if (viewMode === 'family' && familyId) {
        const { data, error } = await supabase
          .from('mv_family_dashboard')
          .select('*')
          .eq('familia_id', familyId)
          .single();

        if (error) throw error;
        return { mode: 'family' as const, data };
      } else {
        const { data, error } = await supabase
          .from('mv_individual_dashboard')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        return { mode: 'individual' as const, data };
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

// Hook adaptativo para Análise de Gastos
export const useAdaptiveAnalytics = (month?: string) => {
  const { user } = useAuth();
  const { viewMode, familyId } = useViewMode();

  return useQuery({
    queryKey: ['adaptive-analytics', viewMode, familyId, month],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

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
          .eq('month', month || new Date().toISOString().slice(0, 7));

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
          .eq('month', month || new Date().toISOString().slice(0, 7));

        if (error) throw error;
        return { mode: 'individual' as const, data: data || [] };
      }
    },
    enabled: !!user,
  });
};
