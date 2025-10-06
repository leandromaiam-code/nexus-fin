import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { useUpdateBudget, useDeleteBudget, useCategorySpending } from '@/hooks/useSupabaseData';
import * as Icons from 'lucide-react';

interface BudgetCategoryCardProps {
  budget: any;
  month: string;
}

const BudgetCategoryCard = ({ budget, month }: BudgetCategoryCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(budget.valor_orcado?.toString() || '0');

  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();
  const { data: spending = [] } = useCategorySpending(month.slice(0, 7));

  const categorySpending = spending.find((s: any) => s.category_id === budget.category_id);
  const spent = Number(categorySpending?.total_spent_in_category || 0);
  const budgeted = Number(budget.valor_orcado || 0);
  const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;

  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-destructive';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-primary';
  };

  const handleSave = () => {
    const value = parseFloat(editValue);
    if (value > 0) {
      updateBudget.mutate({ id: budget.id, valor_orcado: value });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Deseja realmente remover este orçamento?')) {
      deleteBudget.mutate(budget.id);
    }
  };

  const IconComponent = budget.category?.icon_name
    ? (Icons as any)[budget.category.icon_name] || Icons.Tag
    : Icons.Tag;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{budget.category?.name || 'Categoria'}</h3>
              <p className="text-xs text-muted-foreground">{budget.category?.tipo || ''}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {isEditing ? (
              <>
                <Button size="icon" variant="ghost" onClick={handleSave}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <Input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder="Valor orçado"
            className="w-full"
          />
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Orçado</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budgeted)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gasto</span>
                <span className={spent > budgeted ? 'text-destructive font-semibold' : 'font-semibold'}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(spent)}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progresso</span>
                <span className={percentage >= 100 ? 'text-destructive font-medium' : 'font-medium'}>
                  {percentage.toFixed(0)}%
                </span>
              </div>
              <Progress value={Math.min(percentage, 100)} className={getProgressColor()} />
            </div>

            {percentage >= 100 && (
              <p className="text-xs text-destructive">⚠️ Orçamento excedido!</p>
            )}
            {percentage >= 80 && percentage < 100 && (
              <p className="text-xs text-yellow-600">⚠️ Próximo do limite</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetCategoryCard;
