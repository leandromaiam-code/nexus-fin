import React from 'react';
import { TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
  isBalanceVisible: boolean;
  onToggleVisibility: () => void;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  income,
  expenses,
  isBalanceVisible,
  onToggleVisibility,
}) => {
  const isPositive = balance >= 0;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="card-nexus mx-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Balanço Mensal
        </h2>
        <button
          onClick={onToggleVisibility}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {isBalanceVisible ? (
            <EyeOff size={20} className="text-muted-foreground" />
          ) : (
            <Eye size={20} className="text-muted-foreground" />
          )}
        </button>
      </div>

      <div className="space-y-4">
        {/* Main Balance */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Saldo Atual</p>
          <div className="flex items-center justify-center space-x-2">
            {isPositive ? (
              <TrendingUp className="text-success" size={24} />
            ) : (
              <TrendingDown className="text-destructive" size={24} />
            )}
            <span 
              className={cn(
                "text-3xl font-bold text-financial",
                isPositive ? "text-success" : "text-destructive"
              )}
            >
              {isBalanceVisible ? formatCurrency(balance) : "••••"}
            </span>
          </div>
        </div>

        {/* Income vs Expenses */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Entradas</p>
            <span className="text-xl font-semibold text-success text-financial">
              {isBalanceVisible ? formatCurrency(income) : "••••"}
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Saídas</p>
            <span className="text-xl font-semibold text-destructive text-financial">
              {isBalanceVisible ? formatCurrency(expenses) : "••••"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;