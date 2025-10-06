import { Card, CardContent } from '@/components/ui/card';
import { useCategorySpending } from '@/hooks/useSupabaseData';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface BudgetSummaryProps {
  totalBudgeted: number;
  budgets: any[];
  month: string;
}

const BudgetSummary = ({ totalBudgeted, budgets, month }: BudgetSummaryProps) => {
  const { data: spending = [] } = useCategorySpending(month.slice(0, 7));

  const totalSpent = spending.reduce((sum: number, s: any) => {
    const hasBudget = budgets.some((b) => b.category_id === s.category_id);
    return hasBudget ? sum + Number(s.total_spent_in_category || 0) : sum;
  }, 0);

  const remaining = totalBudgeted - totalSpent;
  const percentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const getStatusColor = () => {
    if (percentage >= 100) return 'text-destructive';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-primary';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Orçado</p>
              <p className="text-2xl font-bold mt-1">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalBudgeted)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Gasto</p>
              <p className={`text-2xl font-bold mt-1 ${getStatusColor()}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-destructive/10">
              <TrendingDown className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Disponível</p>
              <p className={`text-2xl font-bold mt-1 ${remaining < 0 ? 'text-destructive' : 'text-primary'}`}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(remaining)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(0)}% utilizado</p>
            </div>
            <div className={`p-3 rounded-full ${remaining < 0 ? 'bg-destructive/10' : 'bg-primary/10'}`}>
              <AlertCircle className={`h-6 w-6 ${remaining < 0 ? 'text-destructive' : 'text-primary'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetSummary;
