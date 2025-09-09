import React from 'react';
import { Target, Calendar } from 'lucide-react';
import { NexusButton } from '@/components/ui/nexus-button';

interface GoalCardProps {
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  targetDate?: string;
  onViewDetails: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goalName,
  currentAmount,
  targetAmount,
  targetDate,
  onViewDetails,
}) => {
  const progress = (currentAmount / targetAmount) * 100;
  const progressClamped = Math.min(Math.max(progress, 0), 100);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="card-nexus mx-6 mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{goalName}</h3>
            <p className="text-sm text-muted-foreground">Meta Primária</p>
          </div>
        </div>
        {targetDate && (
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Calendar size={16} />
            <span className="text-sm">{formatDate(targetDate)}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-foreground text-financial">
              {formatCurrency(currentAmount)}
            </span>
            <span className="text-muted-foreground text-financial">
              {formatCurrency(targetAmount)}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressClamped}%` }}
            />
          </div>
        </div>

        {/* Progress Percentage */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary text-financial">
            {progressClamped.toFixed(1)}%
          </span>
          <NexusButton 
            variant="ghost" 
            size="sm" 
            onClick={onViewDetails}
          >
            Ver Detalhes
          </NexusButton>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;