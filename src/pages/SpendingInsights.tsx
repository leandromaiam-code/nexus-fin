import React, { useState } from 'react';
import { format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Lightbulb, TrendingUp, CreditCard, PieChart } from 'lucide-react';
import BackButton from '@/components/ui/back-button';
import { Card } from '@/components/ui/card';
import MonthFilter from '@/components/dashboard/MonthFilter';
import { MetricCard } from '@/components/analytics/MetricCard';
import { TrendIndicator } from '@/components/analytics/TrendIndicator';
import { useExpenseInsights } from '@/hooks/useAnalyticsData';
import { useRecentTransactions } from '@/hooks/useSupabaseData';

const SpendingInsights = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const { data: insights, isLoading } = useExpenseInsights(selectedMonth);
  const { data: recentTransactions } = useRecentTransactions(10);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const topTransactions = recentTransactions
    ?.filter(t => Number(t.amount) > 0)
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5) || [];

  const getInsightMessage = () => {
    if (!insights) return null;

    const messages = [];

    if (insights.month_over_month_change !== null) {
      const change = Number(insights.month_over_month_change);
      if (change > 10) {
        messages.push({
          type: 'warning',
          text: `Você gastou ${change.toFixed(1)}% a mais que no mês passado.`,
        });
      } else if (change < -10) {
        messages.push({
          type: 'success',
          text: `Parabéns! Você gastou ${Math.abs(change).toFixed(1)}% a menos que no mês passado.`,
        });
      }
    }

    if (insights.categories_used) {
      messages.push({
        type: 'info',
        text: `Você gastou em ${insights.categories_used} categorias diferentes este mês.`,
      });
    }

    if (insights.accounts_used) {
      messages.push({
        type: 'info',
        text: `Você utilizou ${insights.accounts_used} contas de pagamento diferentes.`,
      });
    }

    return messages;
  };

  const insightMessages = getInsightMessage();

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">Insights de Gastos</h1>
          <Lightbulb className="h-8 w-8 text-primary" />
        </div>

        <MonthFilter selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />

        {/* Insights Automáticos */}
        {insightMessages && insightMessages.length > 0 && (
          <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Insights Automáticos</h2>
            </div>
            <ul className="space-y-2">
              {insightMessages.map((msg, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span className="text-foreground">{msg.text}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Métricas Principais */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <MetricCard
              title="Total Gasto"
              value={formatCurrency(Number(insights.total_spent))}
              change={insights.month_over_month_change ? Number(insights.month_over_month_change) : undefined}
              icon={TrendingUp}
            />
            <MetricCard
              title="Transações"
              value={insights.total_transactions || 0}
              subtitle={`Média: ${formatCurrency(Number(insights.avg_spent))}`}
              icon={CreditCard}
            />
            <MetricCard
              title="Categorias Usadas"
              value={insights.categories_used || 0}
              subtitle={`${insights.accounts_used || 0} contas diferentes`}
              icon={PieChart}
            />
          </div>
        )}

        {/* Top 5 Transações */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Top 5 Maiores Transações</h2>
          <div className="space-y-4">
            {topTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{transaction.description || 'Sem descrição'}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction.transaction_date), "d 'de' MMMM", { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(Number(transaction.amount))}
                  </p>
                  {transaction.categories && (
                    <p className="text-xs text-muted-foreground">{transaction.categories.name}</p>
                  )}
                </div>
              </div>
            ))}
            {topTransactions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Nenhuma transação encontrada</p>
            )}
          </div>
        </Card>

        {/* Comparação Multi-Meses */}
        {insights?.prev_month_spent && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Comparação com Mês Anterior</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Mês Anterior</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(Number(insights.prev_month_spent))}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Mês Atual</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(Number(insights.total_spent))}
                </p>
                {insights.month_over_month_change !== null && (
                  <TrendIndicator value={Number(insights.month_over_month_change)} />
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SpendingInsights;
