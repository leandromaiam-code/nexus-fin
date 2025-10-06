import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Plus, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { NexusButton } from '@/components/ui/nexus-button';
import { useUserGoals, useDeleteGoal } from '@/hooks/useSupabaseData';
import { CardSkeleton } from '@/components/ui/skeleton-loader';
import { NoGoalsEmpty } from '@/components/ui/empty-state';
import { EditGoalModal } from '@/components/modals/EditGoalModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import BackButton from '@/components/ui/back-button';

const Plan = () => {
  const navigate = useNavigate();
  const { data: goals, isLoading } = useUserGoals();
  const deleteGoalMutation = useDeleteGoal();
  
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [deleteGoalId, setDeleteGoalId] = useState<number | null>(null);

  const primaryGoal = goals?.find(goal => goal.is_primary);
  const secondaryGoals = goals?.filter(goal => !goal.is_primary) || [];

  const handleCreateGoal = () => {
    navigate('/goal-catalog');
  };

  const handleGoalDetails = (goalId: number) => {
    navigate(`/goal/${goalId}`);
  };

  const handleEditGoal = (goal: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGoal(goal);
  };

  const handleDeleteGoal = (goalId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteGoalId(goalId);
  };

  const confirmDeleteGoal = async () => {
    if (!deleteGoalId) return;
    
    await deleteGoalMutation.mutateAsync(deleteGoalId);
    setDeleteGoalId(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const GoalCard = ({ goal, isPrimary = false }: { goal: any; isPrimary?: boolean }) => {
    const progress = goal.target_amount > 0 ? ((goal.current_amount || 0) / goal.target_amount) * 100 : 0;
    const goalName = goal.goal_templates?.name || goal.custom_name || 'Meta Sem Nome';
    const goalDescription = goal.goal_templates?.description || 'Meta personalizada';

    return (
      <div 
        className={`card-nexus animate-fade-in cursor-pointer transition-all hover:scale-102 ${isPrimary ? 'ring-2 ring-primary/30' : ''} relative group`}
        onClick={() => handleGoalDetails(goal.id)}
      >
        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => handleEditGoal(goal, e)}
            className="p-1 rounded-md bg-background/80 hover:bg-muted transition-colors"
          >
            <Edit size={14} className="text-muted-foreground hover:text-foreground" />
          </button>
          <button
            onClick={(e) => handleDeleteGoal(goal.id, e)}
            className="p-1 rounded-md bg-background/80 hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isPrimary ? 'bg-primary/20' : 'bg-muted'}`}>
              <Target className={`${isPrimary ? 'text-primary' : 'text-muted-foreground'}`} size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{goalName}</h3>
              <p className="text-sm text-muted-foreground">{goalDescription}</p>
            </div>
          </div>
          {isPrimary && (
            <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
              Principal
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-foreground text-financial">
              {formatCurrency(goal.current_amount || 0)}
            </span>
            <span className="text-muted-foreground text-financial">
              {formatCurrency(goal.target_amount)}
            </span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                isPrimary 
                  ? 'bg-gradient-to-r from-primary to-primary/80' 
                  : 'bg-gradient-to-r from-accent to-accent/80'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`text-lg font-bold text-financial ${isPrimary ? 'text-primary' : 'text-accent'}`}>
              {progress.toFixed(1)}%
            </span>
            <NexusButton variant="ghost" size="sm">
              Ver Plano
            </NexusButton>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="p-6">
          <div className="space-y-3">
            <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
          </div>
        </header>
        <div className="px-6 space-y-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-20 md:pb-0 animate-fade-in">
      <header className="p-4 sm:p-6">
        <BackButton to="/dashboard" className="mb-3" />
        <h1 className="text-xl sm:text-2xl font-bold text-display mb-2">Meu Plano Financeiro</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Acompanhe seus objetivos e metas</p>
      </header>

      <div className="px-4 sm:px-6 space-y-4 sm:space-y-6">
        {/* Primary Goal */}
        {primaryGoal ? (
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center">
              <TrendingUp className="mr-2 text-primary" size={18} />
              Meta Primária
            </h2>
            <GoalCard goal={primaryGoal} isPrimary={true} />
          </div>
        ) : (
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center">
              <TrendingUp className="mr-2 text-primary" size={18} />
              Meta Primária
            </h2>
            <div className="card-nexus">
              <NoGoalsEmpty onCreateGoal={handleCreateGoal} />
            </div>
          </div>
        )}

        {/* Secondary Goals */}
        {secondaryGoals.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Outras Metas
              </h2>
              <NexusButton variant="ghost" size="sm" onClick={handleCreateGoal} className="text-xs sm:text-sm">
                <Plus size={14} className="mr-1" />
                <span className="sm:hidden">Nova</span>
                <span className="hidden sm:inline">Nova Meta</span>
              </NexusButton>
            </div>
            
            <div className="space-y-4">
              {secondaryGoals.map((goal, index) => (
                <div key={goal.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <GoalCard goal={goal} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Goal CTA */}
        <div 
          className="card-nexus text-center border-dashed border-2 border-muted-foreground/30 bg-transparent hover:border-primary/50 transition-colors cursor-pointer"
          onClick={handleCreateGoal}
        >
          <div className="flex flex-col items-center py-6">
            <div className="p-3 bg-primary/10 rounded-full mb-3">
              <Plus className="text-primary" size={24} />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Adicionar Nova Meta</h3>
            <p className="text-sm text-muted-foreground">
              Defina um novo objetivo financeiro
            </p>
          </div>
        </div>
      </div>

      {/* Edit Goal Modal */}
      <EditGoalModal
        goal={editingGoal}
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteGoalId} onOpenChange={() => setDeleteGoalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Meta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGoal}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Plan;