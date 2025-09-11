import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Target, 
  CheckCircle2, 
  Circle, 
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUserGoals } from '@/hooks/useSupabaseData';
import { NexusButton } from '@/components/ui/nexus-button';
import { Skeleton } from '@/components/ui/skeleton';

const GoalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: goals, isLoading } = useUserGoals();
  
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set([1, 2]));

  const goal = goals?.find(g => g.id === Number(id));

  // Mock data for progress history
  const progressHistory = [
    { month: 'Jan', amount: 0 },
    { month: 'Fev', amount: 1500 },
    { month: 'Mar', amount: 3200 },
    { month: 'Abr', amount: 4800 },
    { month: 'Mai', amount: 6500 },
    { month: 'Jun', amount: 8200 },
    { month: 'Jul', amount: 9800 },
    { month: 'Ago', amount: 11500 },
    { month: 'Set', amount: goal?.current_amount || 12000 }
  ];

  // Mock action plan steps
  const actionPlan = [
    { id: 1, title: "Analisar gastos atuais", description: "Revisar últimos 3 meses de despesas", completed: true },
    { id: 2, title: "Definir meta de economia mensal", description: "Estabelecer valor fixo para reserva", completed: true },
    { id: 3, title: "Abrir conta poupança específica", description: "Separar reserva de emergência", completed: false },
    { id: 4, title: "Automatizar transferências", description: "Configurar débito automático mensal", completed: false },
    { id: 5, title: "Revisar progresso mensalmente", description: "Ajustar estratégia conforme necessário", completed: false }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const progressPercentage = goal ? (goal.current_amount / goal.target_amount) * 100 : 0;

  const toggleStep = (stepId: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
    
    // TODO: Integrate with n8n webhook
    console.log("Toggle step:", stepId, !completedSteps.has(stepId));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{`${label}`}</p>
          <p className="text-primary text-financial">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="p-6">
          <div className="flex items-center mb-4">
            <Skeleton className="w-6 h-6 mr-4" />
            <Skeleton className="w-48 h-8" />
          </div>
        </header>
        <div className="px-6 space-y-6">
          <Skeleton className="w-full h-32" />
          <Skeleton className="w-full h-64" />
          <Skeleton className="w-full h-48" />
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Meta não encontrada</h2>
          <p className="text-muted-foreground mb-4">A meta solicitada não existe ou foi removida.</p>
          <NexusButton onClick={() => navigate('/plan')}>
            Voltar ao Plano
          </NexusButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="p-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/plan')}
            className="p-2 rounded-lg hover:bg-muted transition-colors mr-2"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-display">
              {goal.goal_templates?.name || goal.custom_name}
            </h1>
            <p className="text-muted-foreground">Detalhes da Meta</p>
          </div>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Goal Overview Card */}
        <div className="card-nexus">
          <div className="flex items-center mb-4">
            <Target className="text-primary mr-2" size={24} />
            <h3 className="text-lg font-semibold text-foreground">Progresso Atual</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Valor Atual</p>
              <p className="text-2xl font-bold text-success text-financial">
                {formatCurrency(goal.current_amount)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Meta</p>
              <p className="text-2xl font-bold text-primary text-financial">
                {formatCurrency(goal.target_amount)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progresso</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-gradient-nexus h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {goal.target_date && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar size={16} className="mr-2" />
              <span>Meta para: {formatDate(goal.target_date)}</span>
            </div>
          )}
        </div>

        {/* Progress Chart */}
        <div className="card-nexus">
          <div className="flex items-center mb-4">
            <TrendingUp className="text-primary mr-2" size={20} />
            <h3 className="font-semibold text-foreground">Evolução da Meta</h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4F46E5" 
                  strokeWidth={3}
                  dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#4F46E5', strokeWidth: 2, fill: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Plan */}
        <div className="card-nexus">
          <div className="flex items-center mb-4">
            <CheckCircle2 className="text-primary mr-2" size={20} />
            <h3 className="font-semibold text-foreground">Plano de Ação</h3>
          </div>

          <div className="space-y-3">
            {actionPlan.map((step) => (
              <div
                key={step.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                  completedSteps.has(step.id)
                    ? 'bg-success/10 border-success/20'
                    : 'bg-muted/30 border-border hover:bg-muted/50'
                }`}
              >
                <button
                  onClick={() => toggleStep(step.id)}
                  className="mt-1 transition-colors"
                >
                  {completedSteps.has(step.id) ? (
                    <CheckCircle2 className="text-success" size={20} />
                  ) : (
                    <Circle className="text-muted-foreground hover:text-primary" size={20} />
                  )}
                </button>

                <div className="flex-1">
                  <h4 className={`font-medium ${
                    completedSteps.has(step.id) 
                      ? 'text-success line-through' 
                      : 'text-foreground'
                  }`}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary/10 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="text-primary mr-2" size={16} />
              <span className="text-sm font-medium text-primary">
                {completedSteps.size} de {actionPlan.length} passos concluídos
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalDetails;