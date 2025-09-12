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
    <div className="card-nexus mx-4 sm:mx-6 mb-4 sm:mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">
          Balanço Mensal
        </h2>
        <button
          onClick={onToggleVisibility}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {isBalanceVisible ? (
            <EyeOff size={18} className="text-muted-foreground sm:hidden" />
          ) : (
            <Eye size={18} className="text-muted-foreground sm:hidden" />
          )}
          {isBalanceVisible ? (
            <EyeOff size={20} className="text-muted-foreground hidden sm:block" />
          ) : (
            <Eye size={20} className="text-muted-foreground hidden sm:block" />
          )}
        </button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Main Balance */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Saldo Atual</p>
          <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
            {isPositive ? (
              <TrendingUp className="text-success" size={20} />
            ) : (
              <TrendingDown className="text-destructive" size={20} />
            )}
            <span 
              className={cn(
                "text-2xl sm:text-3xl font-bold text-financial",
                isPositive ? "text-success" : "text-destructive"
              )}
            >
              {isBalanceVisible ? formatCurrency(balance) : "••••"}
            </span>
          </div>
        </div>

        {/* Income vs Expenses */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Entradas</p>
            <span className="text-lg sm:text-xl font-semibold text-success text-financial">
              {isBalanceVisible ? formatCurrency(income) : "••••"}
            </span>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Saídas</p>
            <span className="text-lg sm:text-xl font-semibold text-destructive text-financial">
              {isBalanceVisible ? formatCurrency(expenses) : "••••"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;