import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// User Data Hook
export const useUserData = () => {
  return useQuery({
    queryKey: ['user-data'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    retry: false
  });
};

// Monthly Summary Hook
export const useMonthlyData = (month?: string) => {
  return useQuery({
    queryKey: ['monthly-data', month],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user ID first
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) throw new Error('User not found');

      const { data, error } = await supabase
        .from('monthly_summaries')
        .select('*')
        .eq('user_id', userData.id)
        .order('month', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data?.[0] || {
        balance: 0,
        total_spent: 0,
        renda_base_amount: 0
      };
    }
  });
};

// User Goals Hook
export const useUserGoals = () => {
  return useQuery({
    queryKey: ['user-goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) throw new Error('User not found');

      const { data, error } = await supabase
        .from('user_goals')
        .select(`
          *,
          goal_templates (
            name,
            description
          )
        `)
        .eq('user_id', userData.id)
        .eq('status', 'active')
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });
};

// Primary Goal Hook
export const usePrimaryGoal = () => {
  return useQuery({
    queryKey: ['primary-goal'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) throw new Error('User not found');

      const { data, error } = await supabase
        .from('user_goals')
        .select(`
          *,
          goal_templates (
            name,
            description
          )
        `)
        .eq('user_id', userData.id)
        .eq('is_primary', true)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });
};

// Recent Transactions Hook
export const useRecentTransactions = (limit = 5) => {
  return useQuery({
    queryKey: ['recent-transactions', limit],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) throw new Error('User not found');

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            name,
            icon_name
          )
        `)
        .eq('user_id', userData.id)
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    }
  });
};

// Category Spending Hook
export const useCategorySpending = (month?: string) => {
  return useQuery({
    queryKey: ['category-spending', month],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) throw new Error('User not found');

      const currentMonth = month || new Date().toISOString().slice(0, 7) + '-01';

      const { data, error } = await supabase
        .from('category_spending_by_month')
        .select('*')
        .eq('user_id', userData.id)
        .eq('month', currentMonth)
        .order('total_spent_in_category', { ascending: false });

      if (error) throw error;
      return data || [];
    }
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
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      let userId = null;

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.id)
          .single();
        userId = userData?.id;
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${userId}`)
        .order('name');

      if (error) throw error;
      return data || [];
    }
  });
};

// Create Goal Mutation
export const useCreateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalData: {
      goal_template_id?: number;
      custom_name?: string;
      target_amount: number;
      target_date?: string;
      is_primary?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!userData) throw new Error('User not found');

      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          user_id: userData.id,
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