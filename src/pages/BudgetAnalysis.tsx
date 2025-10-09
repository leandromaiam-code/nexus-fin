import React, { useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Target, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import BackButton from '@/components/ui/back-button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import MonthFilter from '@/components/dashboard/MonthFilter';
import { MetricCard } from '@/components/analytics/MetricCard';
import { GaugeChart } from '@/components/analytics/GaugeChart';
import { CategoryIcon } from '@/components/analytics/CategoryIcon';
import { BudgetComparisonChart } from '@/components/analytics/BudgetComparisonChart';
import { useBudgetPerformance } from '@/hooks/useAnalyticsData';
import { ViewModeToggle } from '@/components/ui/view-mode-toggle';

const BudgetAnalysis = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const { data: budgetData, isLoading } = useBudgetPerformance(selectedMonth);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalBudgeted = budgetData?.reduce((sum, item) => sum + Number(item.budgeted), 0) || 0;
  const totalSpent = budgetData?.reduce((sum, item) => sum + Number(item.actual_spent), 0) || 0;
  const totalRemaining = totalBudgeted - totalSpent;
  const overallUsage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  // Preparar dados para o gráfico de comparação
  const comparisonData = budgetData?.map(item => ({
    category: item.category_name || 'Sem categoria',
    previsto: Number(item.budgeted),
    realizado: Number(item.actual_spent),
    percentage: Number(item.usage_percentage)
  })) || [];

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: { variant: 'default' as const, icon: CheckCircle2, label: 'Saudável' },
      warning: { variant: 'secondary' as const, icon: AlertTriangle, label: 'Atenção' },
      over_budget: { variant: 'destructive' as const, icon: AlertTriangle, label: 'Excedido' },
    };

    const config = variants[status as keyof typeof variants] || variants.healthy;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <BackButton to="/" />
        <div className="mt-6 text-center text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 pb-24">
      <BackButton to="/" />

      <div className="max-w-7xl mx-auto mt-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">Performance do Orçamento</h1>
            <Target className="h-8 w-8 text-primary" />
          </div>
          <ViewModeToggle />
        </div>

        <MonthFilter selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />

        {/* Overall Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <MetricCard
            title="Total Orçado"
            value={formatCurrency(totalBudgeted)}
            icon={Target}
          />
          <MetricCard
            title="Total Gasto"
            value={formatCurrency(totalSpent)}
            change={overallUsage - 100}
            trend={overallUsage > 100 ? 'down' : overallUsage > 80 ? 'neutral' : 'up'}
            icon={TrendingUp}
          />
          <MetricCard
            title="Restante"
            value={formatCurrency(totalRemaining)}
            subtitle={`${overallUsage.toFixed(1)}% utilizado`}
          />
        </div>

        {/* Budget Comparison Chart */}
        <BudgetComparisonChart data={comparisonData} />

        {/* Gauge Charts */}
        {budgetData && budgetData.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Status por Categoria</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {budgetData.slice(0, 8).map((item) => (
                <GaugeChart
                  key={item.category_id}
                  value={Number(item.actual_spent)}
                  max={Number(item.budgeted)}
                  size="md"
                  label={item.category_name || 'Sem categoria'}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Category Details */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Detalhes por Categoria</h2>
          <div className="space-y-4">
            {budgetData?.map((item) => (
              <div key={item.category_id} className="border-b border-border pb-4 last:border-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <CategoryIcon iconName={item.icon_name} size={24} className="text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">{item.category_name || 'Sem categoria'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(Number(item.actual_spent))} de {formatCurrency(Number(item.budgeted))}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(item.status || 'healthy')}
                </div>
                <Progress value={Math.min(Number(item.usage_percentage), 100)} className="h-2" />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>{Number(item.usage_percentage).toFixed(1)}% utilizado</span>
                  <span>Restante: {formatCurrency(Number(item.remaining))}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BudgetAnalysis;
