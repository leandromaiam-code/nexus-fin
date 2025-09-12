import React, { useState } from 'react';
import { BarChart3, ChevronLeft, ChevronRight, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Analysis = () => {
  const [selectedMonth, setSelectedMonth] = useState(8); // September (0-indexed)
  const [selectedYear] = useState(2025);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Mock spending data by category
  const categoryData = [
    { name: 'Alimentação', value: 1850, color: '#4F46E5', icon: '🍽️' },
    { name: 'Transporte', value: 980, color: '#22C55E', icon: '🚗' },
    { name: 'Moradia', value: 2200, color: '#F59E0B', icon: '🏠' },
    { name: 'Saúde', value: 450, color: '#EF4444', icon: '❤️' },
    { name: 'Lazer', value: 680, color: '#8B5CF6', icon: '🎉' },
    { name: 'Outros', value: 489.50, color: '#6B7280', icon: '📦' }
  ];

  const monthlyTrend = [
    { month: 'Jun', amount: 5200 },
    { month: 'Jul', amount: 5850 },
    { month: 'Ago', amount: 6100 },
    { month: 'Set', amount: 5649.50 }
  ];

  const totalSpent = categoryData.reduce((sum, item) => sum + item.value, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedMonth > 0) {
      setSelectedMonth(selectedMonth - 1);
    } else if (direction === 'next' && selectedMonth < 11) {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{payload[0].payload.name}</p>
          <p className="text-primary text-financial">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-20 md:pb-0">
      <header className="p-4 sm:p-6">
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <button 
            onClick={() => navigateMonth('prev')}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft size={20} className="text-foreground sm:hidden" />
            <ChevronLeft size={24} className="text-foreground hidden sm:block" />
          </button>
          
          <div className="mx-4 sm:mx-6 text-center min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-display">
              {months[selectedMonth]} {selectedYear}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Análise de Gastos</p>
          </div>
          
          <button 
            onClick={() => navigateMonth('next')}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronRight size={20} className="text-foreground sm:hidden" />
            <ChevronRight size={24} className="text-foreground hidden sm:block" />
          </button>
        </div>
      </header>

      <div className="px-4 sm:px-6 space-y-4 sm:space-y-6">
        {/* Total Spent Card */}
        <div className="card-nexus text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingDown className="text-destructive mr-2" size={20} />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Total Gasto</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-destructive text-financial">
            {formatCurrency(totalSpent)}
          </p>
        </div>

        {/* Spending by Category - Pie Chart */}
        <div className="card-nexus">
          <div className="flex items-center mb-3 sm:mb-4">
            <BarChart3 className="text-primary mr-2" size={18} />
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Gastos por Categoria</h3>
          </div>
          
          <div className="h-48 sm:h-64 mb-3 sm:mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                  className="sm:hidden"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                  className="hidden sm:block"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {categoryData.map((category, index) => (
              <button
                key={index}
                onClick={() => window.location.href = `/analysis/category/${index + 1}`}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div 
                  className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-xs sm:text-sm text-foreground flex-1 truncate text-left">
                  {category.icon} {category.name}
                </span>
                <span className="text-xs sm:text-sm font-medium text-financial group-hover:text-primary transition-colors">
                  {formatCurrency(category.value)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Wealth Evolution Link */}
        <button
          onClick={() => window.location.href = '/wealth-evolution'}
          className="w-full p-3 sm:p-4 border-2 border-dashed border-primary/30 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors group"
        >
          <div className="flex items-center justify-center text-primary">
            <TrendingDown size={18} className="mr-2" />
            <span className="font-medium text-sm sm:text-base">Ver Evolução Patrimonial</span>
          </div>
        </button>

        {/* Monthly Trend */}
        <div className="card-nexus">
          <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">
            Tendência dos Últimos Meses
          </h3>
          
          <div className="h-40 sm:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  fontSize={10}
                  className="sm:hidden"
                />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  className="hidden sm:block"
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  className="sm:hidden"
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  className="hidden sm:block"
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'Gasto']}
                  labelStyle={{ color: '#1F2937' }}
                  contentStyle={{ 
                    backgroundColor: '#161B22', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#4F46E5"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;