import React from 'react';
import { LucideIcon } from 'lucide-react';
import { NexusButton } from './nexus-button';

interface EmptyStateProps {
  icon: LucideIcon | React.ComponentType<any>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="text-muted-foreground" size={24} />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <NexusButton onClick={onAction}>
          {actionLabel}
        </NexusButton>
      )}
    </div>
  );
};

// Specific empty states
export const NoTransactionsEmpty = ({ onAddTransaction }: { onAddTransaction?: () => void }) => {
  const DollarIcon = () => (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  );
  
  return (
    <EmptyState
      icon={DollarIcon}
      title="Nenhuma transação ainda"
      description="Comece a registrar suas despesas para ver relatórios detalhados aqui."
      actionLabel={onAddTransaction ? "Registrar Primeira Despesa" : undefined}
      onAction={onAddTransaction}
    />
  );
};

export const NoGoalsEmpty = ({ onCreateGoal }: { onCreateGoal?: () => void }) => {
  const TargetIcon = () => (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    </svg>
  );
  
  return (
    <EmptyState
      icon={TargetIcon}
      title="Nenhuma meta definida"
      description="Crie suas primeiras metas financeiras para começar a planejar seu futuro."
      actionLabel={onCreateGoal ? "Criar Primeira Meta" : undefined}
      onAction={onCreateGoal}
    />
  );
};