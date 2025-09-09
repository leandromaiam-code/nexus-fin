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
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Math.abs(value));
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
    <div className="px-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Transações Recentes
        </h3>
        <button 
          onClick={onViewAll}
          className="text-primary text-sm font-medium hover:underline"
        >
          Ver todas
        </button>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction, index) => {
          const CategoryIcon = getCategoryIcon(transaction.categoryIcon);
          
          return (
            <div
              key={transaction.id}
              className={cn(
                "card-nexus !p-4 transition-all duration-300",
                "hover:scale-[1.02] hover:shadow-lg"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  transaction.isIncome 
                    ? "bg-success/10" 
                    : "bg-muted"
                )}>
                  <CategoryIcon 
                    size={20} 
                    className={cn(
                      transaction.isIncome 
                        ? "text-success" 
                        : "text-muted-foreground"
                    )}
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {transaction.description}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>{transaction.categoryName}</span>
                    <span>•</span>
                    <span>{formatDate(transaction.date)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  {transaction.isIncome ? (
                    <ArrowDownRight className="text-success" size={16} />
                  ) : (
                    <ArrowUpRight className="text-destructive" size={16} />
                  )}
                  <span className={cn(
                    "font-bold text-financial",
                    transaction.isIncome ? "text-success" : "text-destructive"
                  )}>
                    {transaction.isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionFeed;