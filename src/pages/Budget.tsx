import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useBudgets, useCategories } from '@/hooks/useSupabaseData';
import MonthFilter from '@/components/dashboard/MonthFilter';
import BudgetCategoryCard from '@/components/budget/BudgetCategoryCard';
import AddBudgetModal from '@/components/budget/AddBudgetModal';
import BudgetSummary from '@/components/budget/BudgetSummary';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/components/ui/back-button';

const Budget = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7) + '-01');
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: budgets = [], isLoading: isLoadingBudgets } = useBudgets(selectedMonth);
  const { data: categories = [] } = useCategories();

  const handleMonthChange = (newMonth: string) => {
    // newMonth vem no formato 'YYYY-MM'
    const formatted = newMonth + '-01';
    setSelectedMonth(formatted);
  };

  const availableCategories = categories.filter(
    (cat) => !budgets.some((b: any) => b.category_id === cat.id)
  );

  const totalBudgeted = budgets.reduce((sum: number, b: any) => sum + Number(b.valor_orcado || 0), 0);

  if (isLoadingBudgets) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <header className="space-y-4">
        <BackButton to="/dashboard" />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Orçamentos</h1>
            <p className="text-muted-foreground">Defina e acompanhe seus limites por categoria</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Orçamento
          </Button>
        </div>
      </header>

      <MonthFilter selectedMonth={selectedMonth} onMonthChange={handleMonthChange} />

      <BudgetSummary totalBudgeted={totalBudgeted} budgets={budgets} month={selectedMonth} />

      {budgets.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">Nenhum orçamento configurado para este mês</p>
          <Button onClick={() => setShowAddModal(true)} variant="outline">
            Adicionar Primeiro Orçamento
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget: any) => (
            <BudgetCategoryCard key={budget.id} budget={budget} month={selectedMonth} />
          ))}
        </div>
      )}

      <AddBudgetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        availableCategories={availableCategories}
        month={selectedMonth}
      />
    </div>
  );
};

export default Budget;
