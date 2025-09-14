import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Target, 
  CheckCircle2, 
  Circle, 
  TrendingUp,
  Calendar,
  DollarSign,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  useUserGoals, 
  useActionPlans, 
  useUserActionPlan, 
  usePlanSteps, 
  useStepProgress, 
  useToggleStepProgress,
  useCustomActions,
  useCreateCustomAction,
  useUpdateCustomAction,
  useDeleteCustomAction,
  useToggleCustomActionProgress
} from '@/hooks/useSupabaseData';
import { NexusButton } from '@/components/ui/nexus-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

const GoalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: goals, isLoading } = useUserGoals();
  
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionDescription, setNewActionDescription] = useState('');
  const [showAddAction, setShowAddAction] = useState(false);
  const [editingAction, setEditingAction] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const goal = goals?.find(g => g.id === Number(id));
  const goalId = Number(id);

  // Fetch action plan data
  const { data: actionPlans } = useActionPlans(goal?.goal_template_id);
  const { data: userActionPlan } = useUserActionPlan(goalId);
  const { data: planSteps } = usePlanSteps(actionPlans?.[0]?.id);
  const { data: stepProgress } = useStepProgress(userActionPlan?.id);
  const { data: customActions } = useCustomActions(userActionPlan?.id);
  
  const toggleStepMutation = useToggleStepProgress();
  const createCustomAction = useCreateCustomAction();
  const updateCustomAction = useUpdateCustomAction();
  const deleteCustomAction = useDeleteCustomAction();
  const toggleCustomActionProgress = useToggleCustomActionProgress();

  // Determine completed steps
  const completedStepIds = useMemo(() => {
    return stepProgress?.map(sp => sp.plan_step_id) || [];
  }, [stepProgress]);

  // Combine standard steps and custom actions
  const allActions = useMemo(() => {
    const standardSteps = (planSteps || []).map(step => ({
      ...step,
      type: 'standard' as const,
      isCompleted: completedStepIds.includes(step.id)
    }));

    const customSteps = (customActions || []).map(action => ({
      ...action,
      type: 'custom' as const,
      isCompleted: action.is_completed
    }));

    return [...standardSteps, ...customSteps].sort((a, b) => a.step_order - b.step_order);
  }, [planSteps, customActions, completedStepIds]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const progressPercentage = goal?.target_amount ? 
    Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0;

  const toggleStep = (stepId: number, isCustom: boolean = false) => {
    if (!userActionPlan?.id) return;
    
    if (isCustom) {
      const action = customActions?.find(a => a.id === stepId);
      if (action) {
        toggleCustomActionProgress.mutate({
          id: stepId,
          isCompleted: action.is_completed
        });
      }
    } else {
      toggleStepMutation.mutate({
        userActionPlanId: userActionPlan.id,
        planStepId: stepId
      });
    }
  };

  const handleAddAction = async () => {
    if (!userActionPlan?.id || !newActionTitle.trim()) return;
    
    try {
      const nextOrder = Math.max(0, ...allActions.map(a => a.step_order)) + 1;
      
      await createCustomAction.mutateAsync({
        userActionPlanId: userActionPlan.id,
        title: newActionTitle.trim(),
        content: newActionDescription.trim(),
        stepOrder: nextOrder
      });
      
      setNewActionTitle('');
      setNewActionDescription('');
      setShowAddAction(false);
      toast({ title: "Ação adicionada com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao adicionar ação", variant: "destructive" });
    }
  };

  const handleEditAction = async () => {
    if (!editingAction || !editTitle.trim()) return;
    
    try {
      await updateCustomAction.mutateAsync({
        id: editingAction.id,
        title: editTitle.trim(),
        content: editContent.trim()
      });
      
      setEditingAction(null);
      setEditTitle('');
      setEditContent('');
      toast({ title: "Ação atualizada com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao atualizar ação", variant: "destructive" });
    }
  };

  const handleDeleteAction = async (actionId: number) => {
    try {
      await deleteCustomAction.mutateAsync(actionId);
      toast({ title: "Ação removida com sucesso!" });
    } catch (error) {
      toast({ title: "Erro ao remover ação", variant: "destructive" });
    }
  };

  const startEditAction = (action: any) => {
    setEditingAction(action);
    setEditTitle(action.title);
    setEditContent(action.content || '');
  };

  // Mock progress data - this would come from your backend
  const progressHistory = [
    { month: 'Jan', amount: 0 },
    { month: 'Feb', amount: 500 },
    { month: 'Mar', amount: 1200 },
    { month: 'Apr', amount: 2000 },
    { month: 'May', amount: 3000 },
    { month: 'Jun', amount: goal?.current_amount || 0 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-primary">
            Valor: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Meta não encontrada</h2>
          <p className="text-muted-foreground mb-4">
            A meta que você está procurando não existe ou foi removida.
          </p>
          <NexusButton onClick={() => navigate('/plan')}>
            Voltar para Planos
          </NexusButton>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/plan')}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{goal.custom_name || goal.goal_templates?.name}</h1>
          <p className="text-muted-foreground">{goal.goal_templates?.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goal Overview Card */}
        <div className="bg-card rounded-lg border p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Resumo da Meta</h2>
              <p className="text-sm text-muted-foreground">Progresso atual</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Valor atual</span>
              <span className="font-semibold text-lg">{formatCurrency(goal.current_amount || 0)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Meta</span>
              <span className="font-semibold text-lg">{formatCurrency(goal.target_amount)}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Progresso</span>
                <span className="text-sm font-medium">{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>

            {goal.target_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Data meta: {formatDate(goal.target_date)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Chart */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Evolução</h2>
              <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Plano de Ação</h2>
              <p className="text-sm text-muted-foreground">Passos para alcançar sua meta</p>
            </div>
          </div>
          
          <Dialog open={showAddAction} onOpenChange={setShowAddAction}>
            <Button onClick={() => setShowAddAction(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Ação
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Ação Personalizada</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título da Ação</Label>
                  <Input
                    id="title"
                    value={newActionTitle}
                    onChange={(e) => setNewActionTitle(e.target.value)}
                    placeholder="Digite o título da ação"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={newActionDescription}
                    onChange={(e) => setNewActionDescription(e.target.value)}
                    placeholder="Digite uma descrição detalhada"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddAction} disabled={!newActionTitle.trim()}>
                    Adicionar Ação
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddAction(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {allActions.map((action) => (
            <div
              key={`${action.type}-${action.id}`}
              className="flex items-start gap-4 p-4 rounded-lg border bg-background hover:bg-muted/50 transition-colors"
            >
              <button
                onClick={() => toggleStep(action.id, action.type === 'custom')}
                className="mt-1"
              >
                {action.isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className={`font-medium ${action.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                    {action.title}
                  </h4>
                  {action.type === 'custom' && (
                    <Badge variant="outline" className="text-xs">
                      Personalizada
                    </Badge>
                  )}
                </div>
                {action.content && (
                  <p className={`text-sm ${action.isCompleted ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                    {action.content}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {action.type === 'custom' && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditAction(action)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover ação</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover esta ação? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteAction(action.id)}>
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Progresso do Plano</h3>
              <p className="text-sm text-muted-foreground">
                {allActions.filter(a => a.isCompleted).length} de {allActions.length} ações concluídas
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">
                {allActions.length > 0 ? Math.round((allActions.filter(a => a.isCompleted).length / allActions.length) * 100) : 0}%
              </span>
              <p className="text-xs text-muted-foreground">completo</p>
            </div>
          </div>
        </div>

        {/* Edit Action Modal */}
        <Dialog open={!!editingAction} onOpenChange={() => setEditingAction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Ação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título da Ação</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Digite o título da ação"
                />
              </div>
              <div>
                <Label htmlFor="edit-content">Descrição (opcional)</Label>
                <Textarea
                  id="edit-content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Digite uma descrição detalhada"
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditAction} disabled={!editTitle.trim()}>
                  Salvar Alterações
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingAction(null)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default GoalDetails;