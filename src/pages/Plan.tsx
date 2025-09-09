import React from 'react';
import { Target, Plus, TrendingUp } from 'lucide-react';
import { NexusButton } from '@/components/ui/nexus-button';

const Plan = () => {
  // Mock data for goals
  const primaryGoal = {
    id: "1",
    name: "Reserva de Emergência",
    description: "6 meses de gastos essenciais",
    currentAmount: 12500.00,
    targetAmount: 25000.00,
    progress: 50,
    isPrimary: true
  };

  const secondaryGoals = [
    {
      id: "2",
      name: "Viagem para Europa",
      description: "Férias dos sonhos em 2026",
      currentAmount: 3200.00,
      targetAmount: 15000.00,
      progress: 21.3,
      isPrimary: false
    },
    {
      id: "3",
      name: "Novo Notebook",
      description: "Upgrade para trabalho",
      currentAmount: 800.00,
      targetAmount: 4500.00,
      progress: 17.8,
      isPrimary: false
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const GoalCard = ({ goal, isPrimary = false }: { goal: any; isPrimary?: boolean }) => (
    <div className={`card-nexus animate-fade-in ${isPrimary ? 'ring-2 ring-primary/30' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isPrimary ? 'bg-primary/20' : 'bg-muted'}`}>
            <Target className={`${isPrimary ? 'text-primary' : 'text-muted-foreground'}`} size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{goal.name}</h3>
            <p className="text-sm text-muted-foreground">{goal.description}</p>
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
            {formatCurrency(goal.currentAmount)}
          </span>
          <span className="text-muted-foreground text-financial">
            {formatCurrency(goal.targetAmount)}
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              isPrimary 
                ? 'bg-gradient-to-r from-primary to-primary/80' 
                : 'bg-gradient-to-r from-accent to-accent/80'
            }`}
            style={{ width: `${Math.min(goal.progress, 100)}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span className={`text-lg font-bold text-financial ${isPrimary ? 'text-primary' : 'text-accent'}`}>
            {goal.progress.toFixed(1)}%
          </span>
          <NexusButton variant="ghost" size="sm">
            Ver Plano
          </NexusButton>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="p-6">
        <h1 className="text-2xl font-bold text-display mb-2">Meu Plano Financeiro</h1>
        <p className="text-muted-foreground">Acompanhe seus objetivos e metas</p>
      </header>

      <div className="px-6 space-y-6">
        {/* Primary Goal */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <TrendingUp className="mr-2 text-primary" size={20} />
            Meta Primária
          </h2>
          <GoalCard goal={primaryGoal} isPrimary={true} />
        </div>

        {/* Secondary Goals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Outras Metas
            </h2>
            <NexusButton variant="ghost" size="sm">
              <Plus size={16} className="mr-1" />
              Nova Meta
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

        {/* Add Goal CTA */}
        <div className="card-nexus text-center border-dashed border-2 border-muted-foreground/30 bg-transparent hover:border-primary/50 transition-colors cursor-pointer">
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
    </div>
  );
};

export default Plan;