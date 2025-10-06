import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface BudgetComparisonData {
  category: string;
  previsto: number;
  realizado: number;
  percentage: number;
}

interface BudgetComparisonChartProps {
  data: BudgetComparisonData[];
}

export const BudgetComparisonChart: React.FC<BudgetComparisonChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getBarColor = (percentage: number) => {
    if (percentage > 100) return 'hsl(var(--destructive))';
    if (percentage > 80) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">{data.category}</p>
          <div className="space-y-1 text-sm">
            <p className="text-primary">
              Previsto: <span className="font-medium">{formatCurrency(data.previsto)}</span>
            </p>
            <p style={{ color: getBarColor(data.percentage) }}>
              Realizado: <span className="font-medium">{formatCurrency(data.realizado)}</span>
            </p>
            <p className="text-muted-foreground">
              Utilização: <span className="font-medium">{data.percentage.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Limitar a top 10 categorias ordenadas por valor gasto
  const topData = [...data]
    .sort((a, b) => b.realizado - a.realizado)
    .slice(0, 10);

  if (topData.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Previsto x Realizado</h2>
        </div>
        <p className="text-center text-muted-foreground py-8">
          Nenhum dado disponível para o período selecionado
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Previsto x Realizado</h2>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={topData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="category"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: 'hsl(var(--foreground))' }}
            stroke="hsl(var(--border))"
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fill: 'hsl(var(--foreground))' }}
            stroke="hsl(var(--border))"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
          />
          <Bar
            dataKey="previsto"
            name="Previsto"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="realizado"
            name="Realizado"
            radius={[4, 4, 0, 0]}
          >
            {topData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {data.length > 10 && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          Mostrando top 10 categorias por gasto
        </p>
      )}
    </Card>
  );
};
