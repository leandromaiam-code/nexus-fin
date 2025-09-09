import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// User Data Hook
export const useUserData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-data', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user logged in');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

// Monthly Summary Hook
export const useMonthlyData = (month?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['monthly-data', user?.id, month],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user logged in');

      const targetMonth = month || new Date().toISOString().slice(0, 7) + '-01';
      
      const { data, error } = await supabase
        .from('monthly_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', targetMonth)
        .order('month', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

// User Goals Hook
export const useUserGoals = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-goals', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user logged in');
      
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
        .eq('status', 'active');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
};

// Primary Goal Hook
export const usePrimaryGoal = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['primary-goal', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user logged in');

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
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};

// Recent Transactions Hook
export const useRecentTransactions = (limit = 5) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['recent-transactions', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user logged in');

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
    enabled: !!user?.id,
  });
};

// Category Spending Hook
export const useCategorySpending = (month?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['category-spending', user?.id, month],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user logged in');

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
    enabled: !!user?.id,
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
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${user?.id || 0}`)
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });
};

// Create Goal Mutation
export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (goalData: {
      goal_template_id?: number;
      custom_name?: string;
      target_amount: number;
      target_date?: string;
      is_primary?: boolean;
    }) => {
      if (!user?.id) throw new Error('No user logged in');

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