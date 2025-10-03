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

      // Default to current month if not provided
      const targetMonth = month || new Date().toISOString().slice(0, 7) + '-01';

      const { data, error } = await supabase
        .from('monthly_summaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', targetMonth)
        .maybeSingle();

      if (error) throw error;
      
      // Return zeroed values if no data for this month
      return data || {
        user_id: user.id,
        month: targetMonth,
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
      current_amount?: number;
    }) => {
      if (!isAuthenticated || !user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          current_amount: goalData.current_amount || 0,
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

// Update Transaction Mutation
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ transactionId, transactionData }: { 
      transactionId: number; 
      transactionData: {
        description?: string;
        amount?: number;
        category_id?: number;
        transaction_date?: string;
      }
    }) => {
      if (!isAuthenticated || !user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-data'] });
      queryClient.invalidateQueries({ queryKey: ['category-spending'] });
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar transação. Tente novamente.",
        variant: "destructive"
      });
    }
  });
};

// Update Goal Mutation
export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ goalId, goalData }: { 
      goalId: number; 
      goalData: {
        custom_name?: string;
        target_amount?: number;
        target_date?: string;
        current_amount?: number;
      }
    }) => {
      if (!isAuthenticated || !user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('user_goals')
        .update(goalData)
        .eq('id', goalId)
        .eq('user_id', user.id)
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
        description: "Meta atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar meta. Tente novamente.",
        variant: "destructive"
      });
    }
  });
};

// Delete Goal Mutation
export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useCurrentUser();

  return useMutation({
    mutationFn: async (goalId: number) => {
      if (!isAuthenticated || !user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;
      return goalId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
      queryClient.invalidateQueries({ queryKey: ['primary-goal'] });
      toast({
        title: "Sucesso",
        description: "Meta excluída com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir meta. Tente novamente.",
        variant: "destructive"
      });
    }
  });
};

// Action Plans Hooks
export const useActionPlans = (goalTemplateId?: number) => {
  return useQuery({
    queryKey: ['action-plans', goalTemplateId],
    queryFn: async () => {
      if (!goalTemplateId) return [];

      const { data, error } = await supabase
        .from('action_plans')
        .select('*')
        .eq('goal_template_id', goalTemplateId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!goalTemplateId
  });
};

export const useUserActionPlan = (userGoalId: number) => {
  const { user, isAuthenticated } = useCurrentUser();

  return useQuery({
    queryKey: ['user-action-plan', userGoalId, user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('user_action_plans')
        .select('*')
        .eq('user_goal_id', userGoalId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isAuthenticated && !!user && !!userGoalId
  });
};

export const usePlanSteps = (planId?: number) => {
  return useQuery({
    queryKey: ['plan-steps', planId],
    queryFn: async () => {
      if (!planId) return [];

      const { data, error } = await supabase
        .from('plan_steps')
        .select('*')
        .eq('plan_id', planId)
        .order('step_order');

      if (error) throw error;
      return data || [];
    },
    enabled: !!planId
  });
};

export const useStepProgress = (userActionPlanId?: number) => {
  return useQuery({
    queryKey: ['step-progress', userActionPlanId],
    queryFn: async () => {
      if (!userActionPlanId) return [];

      const { data, error } = await supabase
        .from('user_plan_step_progress')
        .select('*')
        .eq('user_action_plan_id', userActionPlanId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userActionPlanId
  });
};

// Create User Action Plan Mutation
export const useCreateUserActionPlan = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useCurrentUser();
  
  return useMutation({
    mutationFn: async ({ userGoalId, planId }: { userGoalId: number; planId: number }) => {
      if (!isAuthenticated || !user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('user_action_plans')
        .insert({
          user_goal_id: userGoalId,
          plan_id: planId,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-action-plan'] });
      toast({
        title: "Plano de ação criado",
        description: "Agora você pode adicionar ações personalizadas!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar plano",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  });
};

// Toggle Step Progress Mutation
export const useToggleStepProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userActionPlanId, 
      planStepId 
    }: { 
      userActionPlanId: number; 
      planStepId: number; 
    }) => {
      // Check if progress record exists
      const { data: existing } = await supabase
        .from('user_plan_step_progress')
        .select('id')
        .eq('user_action_plan_id', userActionPlanId)
        .eq('plan_step_id', planStepId)
        .maybeSingle();

      if (existing) {
        // Delete existing progress (uncheck)
        const { error } = await supabase
          .from('user_plan_step_progress')
          .delete()
          .eq('id', existing.id);
        
        if (error) throw error;
        return { action: 'unchecked' };
      } else {
        // Create new progress record (check)
        const { error } = await supabase
          .from('user_plan_step_progress')
          .insert({
            user_action_plan_id: userActionPlanId,
            plan_step_id: planStepId,
            completed_at: new Date().toISOString()
          });
        
        if (error) throw error;
        return { action: 'checked' };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['step-progress'] });
    },
  });
};

// Custom Actions Hooks
export const useCustomActions = (userActionPlanId?: number) => {
  return useQuery({
    queryKey: ['custom-actions', userActionPlanId],
    queryFn: async () => {
      if (!userActionPlanId) return [];
      
      const { data, error } = await supabase
        .from('user_custom_actions')
        .select('*')
        .eq('user_action_plan_id', userActionPlanId)
        .order('step_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userActionPlanId,
  });
};

export const useCreateCustomAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userActionPlanId, 
      title, 
      content,
      stepOrder 
    }: { 
      userActionPlanId: number; 
      title: string; 
      content?: string;
      stepOrder: number;
    }) => {
      const { data, error } = await supabase
        .from('user_custom_actions')
        .insert({
          user_action_plan_id: userActionPlanId,
          title,
          content: content || '',
          step_order: stepOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-actions'] });
    },
  });
};

export const useUpdateCustomAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      title, 
      content 
    }: { 
      id: number; 
      title: string; 
      content?: string; 
    }) => {
      const { data, error } = await supabase
        .from('user_custom_actions')
        .update({ title, content })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-actions'] });
    },
  });
};

export const useDeleteCustomAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('user_custom_actions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-actions'] });
    },
  });
};

export const useToggleCustomActionProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number; isCompleted: boolean }) => {
      const { data, error } = await supabase
        .from('user_custom_actions')
        .update({ 
          is_completed: !isCompleted,
          completed_at: !isCompleted ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-actions'] });
    },
  });
};

// Delete Transaction Mutation
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useCurrentUser();

  return useMutation({
    mutationFn: async (transactionId: number) => {
      if (!isAuthenticated || !user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id);

      if (error) throw error;
      return transactionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-data'] });
      queryClient.invalidateQueries({ queryKey: ['category-spending'] });
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir transação. Tente novamente.",
        variant: "destructive"
      });
    }
  });
};