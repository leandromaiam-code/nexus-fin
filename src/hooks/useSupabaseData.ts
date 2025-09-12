import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Helper hook to get current user from auth context
const useCurrentUser = () => {
  const { user, session } = useAuth();
  return { user, session, isAuthenticated: !!session?.user };
};

// User Data Hook
export const useUserData = () => {
  const { user, isAuthenticated } = useCurrentUser();
  
  return useQuery({
    queryKey: ['user-data', user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error('Not authenticated');
      }
      return user;
    },
    enabled: isAuthenticated && !!user,
    retry: false
  });
};

// Monthly Summary Hook
export const useMonthlyData = (month?: string) => {
  const { user, isAuthenticated } = useCurrentUser();
  
  return useQuery({
    queryKey: ['monthly-data', month, user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('monthly_summaries')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data?.[0] || {
        balance: 0,
        total_spent: 0,
        renda_base_amount: 0
      };
    },
    enabled: isAuthenticated && !!user
  });
};

// User Goals Hook
export const useUserGoals = () => {
  const { user, isAuthenticated } = useCurrentUser();
  
  return useQuery({
    queryKey: ['user-goals', user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('user_goals')
        .select(`
          *,
          goal_templates (
            name,
            description
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated && !!user
  });
};

// Primary Goal Hook
export const usePrimaryGoal = () => {
  const { user, isAuthenticated } = useCurrentUser();
  
  return useQuery({
    queryKey: ['primary-goal', user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('user_goals')
        .select(`
          *,
          goal_templates (
            name,
            description
          )
        `)
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated && !!user
  });
};

// Recent Transactions Hook
export const useRecentTransactions = (limit = 5) => {
  const { user, isAuthenticated } = useCurrentUser();
  
  return useQuery({
    queryKey: ['recent-transactions', limit, user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            name,
            icon_name
          )
        `)
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated && !!user
  });
};

// Category Spending Hook
export const useCategorySpending = (month?: string) => {
  const { user, isAuthenticated } = useCurrentUser();
  
  return useQuery({
    queryKey: ['category-spending', month, user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error('Not authenticated');
      }

      const currentMonth = month || new Date().toISOString().slice(0, 7) + '-01';

      const { data, error } = await supabase
        .from('category_spending_by_month')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .order('total_spent_in_category', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: isAuthenticated && !!user
  });
};

// Goal Templates Hook
export const useGoalTemplates = () => {
  return useQuery({
    queryKey: ['goal-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goal_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });
};

// Categories Hook
export const useCategories = () => {
  const { user } = useCurrentUser();
  
  return useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.is.null${user ? `,user_id.eq.${user.id}` : ''}`)
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });
};

// Create Goal Mutation
export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useCurrentUser();

  return useMutation({
    mutationFn: async (goalData: {
      goal_template_id?: number;
      custom_name?: string;
      target_amount: number;
      target_date?: string;
      is_primary?: boolean;
    }) => {
      if (!isAuthenticated || !user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          ...goalData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
      queryClient.invalidateQueries({ queryKey: ['primary-goal'] });
      toast({
        title: "Sucesso",
        description: "Meta criada com sucesso!",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar meta. Tente novamente.",
        variant: "destructive"
      });
    }
  });
};

// Update Goal Progress Mutation
export const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: number; amount: number }) => {
      const { data, error } = await supabase
        .from('user_goals')
        .update({ current_amount: amount })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
      queryClient.invalidateQueries({ queryKey: ['primary-goal'] });
      toast({
        title: "Progresso Atualizado",
        description: "Meta atualizada com sucesso!",
      });
    }
  });
};