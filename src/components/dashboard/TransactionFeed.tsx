import React from 'react';
import { 
  ShoppingCart, 
  Car, 
  Home, 
  Utensils, 
  Heart, 
  ArrowUpRight,
  ArrowDownRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  categoryName: string;
  categoryIcon: string;
  isIncome: boolean;
  date: string;
}

interface TransactionFeedProps {
  transactions: Transaction[];
  onViewAll: () => void;
}

const getCategoryIcon = (iconName: string) => {
  const icons = {
    shopping: ShoppingCart,
    car: Car,
    home: Home,
    food: Utensils,
    health: Heart,
  };
  return icons[iconName as keyof typeof icons] || ShoppingCart;
};

const TransactionFeed: React.FC<TransactionFeedProps> = ({
  transactions,
  onViewAll,
}) => {
  const formatCurrency = (value: number, isIncome: boolean) => {
    const absoluteValue = Math.abs(value);
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(absoluteValue);
    
    return isIncome ? `+${formatted}` : `-${formatted}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoje';
    if (diffInDays === 1) return 'Ontem';
    if (diffInDays < 7) return `${diffInDays} dias atrás`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="px-4 sm:px-6 pb-20 sm:pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">
          Transações Recentes
        </h3>
        <button 
          onClick={onViewAll}
          className="text-primary text-xs sm:text-sm font-medium hover:underline"
        >
          Ver todas
        </button>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {transactions.map((transaction, index) => {
          const CategoryIcon = getCategoryIcon(transaction.categoryIcon);
          
          return (
            <div
              key={transaction.id}
              className={cn(
                "card-nexus !p-3 sm:!p-4 transition-all duration-300",
                "hover:scale-[1.01] sm:hover:scale-[1.02] hover:shadow-lg"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center space-x-2.5 sm:space-x-3">
                <div className={cn(
                  "p-1.5 sm:p-2 rounded-lg flex-shrink-0",
                  transaction.isIncome 
                    ? "bg-success/10" 
                    : "bg-destructive/10"
                )}>
                  <CategoryIcon 
                    size={18} 
                    className={cn(
                      transaction.isIncome 
                        ? "text-success" 
                        : "text-destructive",
                      "sm:hidden"
                    )}
                  />
                  <CategoryIcon 
                    size={20} 
                    className={cn(
                      transaction.isIncome 
                        ? "text-success" 
                        : "text-destructive",
                      "hidden sm:block"
                    )}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate text-sm sm:text-base">
                    {transaction.description}
                  </p>
                  <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-muted-foreground">
                    <span className="truncate">{transaction.categoryName}</span>
                    <span>•</span>
                    <span className="whitespace-nowrap">{formatDate(transaction.date)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 flex-shrink-0">
                  {transaction.isIncome ? (
                    <ArrowDownRight className="text-success" size={14} />
                  ) : (
                    <ArrowUpRight className="text-destructive" size={14} />
                  )}
                  <span className={cn(
                    "font-bold text-financial text-sm sm:text-base",
                    transaction.isIncome ? "text-success" : "text-destructive"
                  )}>
                    {formatCurrency(transaction.amount, transaction.isIncome)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Ver Todas Button */}
        <button
          onClick={onViewAll}
          className="w-full card-nexus !p-4 border-2 border-dashed border-muted hover:border-primary hover:bg-muted/50 transition-all duration-300 group"
        >
          <div className="flex items-center justify-center space-x-2 text-muted-foreground group-hover:text-primary">
            <span className="font-medium text-sm sm:text-base">Ver todas as transações</span>
            <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default TransactionFeed;