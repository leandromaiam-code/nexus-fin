import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingDown, Wallet, CreditCard, Utensils, Car, Home, Gamepad2, Coffee, ShoppingBag } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { format } from 'date-fns';
import { useCategories } from '@/hooks/useSupabaseData';
import { useAdaptiveAnalyticsByParent, useAdaptiveTransactions } from '@/hooks/useAdaptiveData';
import BackButton from '@/components/ui/back-button';
import MonthFilter from '@/components/dashboard/MonthFilter';

const Analysis = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM-01'));

  // Get real data from Supabase - usando hooks adaptativos (apenas categorias PAI)
  const { data: analyticsData, isLoading: analyticsLoading } = useAdaptiveAnalyticsByParent(selectedMonth);
  const { data: transactionsData, isLoading: transactionsLoading } = useAdaptiveTransactions(500);
  const { data: categories = [] } = useCategories();

  const categorySpending = analyticsData?.data || [];
  const transactions = transactionsData?.data || [];

  // Icon mapping for categories
  const getCategoryIcon = (iconName: string, categoryName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'food': Utensils,
      'transport': Car,
      'house': Home,
      'entertainment': Gamepad2,
      'coffee': Coffee,
      'shopping': ShoppingBag,
      'card': CreditCard,
      'wallet': Wallet
    };
    
    // Try to match by icon name first, then by category name
    const IconComponent = iconMap[iconName] || 
                         iconMap[categoryName?.toLowerCase()] ||
                         iconMap[Object.keys(iconMap).find(key => 
                           categoryName?.toLowerCase().includes(key)
                         ) || ''] ||
                         Wallet;
    
    return IconComponent;
  };

  // Process real category data
  const categoryData = useMemo(() => {
    const colors = [
      '#6366F1', // Indigo
      '#10B981', // Verde esmeralda
      '#F59E0B', // Âmbar
      '#EF4444', // Vermelho
      '#8B5CF6', // Roxo
      '#EC4899', // Rosa
      '#14B8A6', // Teal
      '#F97316', // Laranja
      '#06B6D4', // Ciano
      '#84CC16', // Lima
      '#A855F7', // Púrpura
      '#FB923C', // Laranja claro
      '#22D3EE', // Ciano claro
      '#F472B6', // Rosa claro
      '#FACC15', // Amarelo
      '#4ADE80', // Verde claro
      '#60A5FA', // Azul claro
      '#C084FC', // Violeta claro
    ];
    
    return categorySpending.map((item, index) => {
      const category = categories.find(c => c.id === item.category_id);
      const IconComponent = getCategoryIcon(category?.icon_name || '', item.category_name || '');
      
      return {
        id: item.category_id,
        name: item.category_name || 'Sem categoria',
        value: Number(item.total_spent || 0),
        color: colors[index % colors.length],
        icon: category?.icon_name || '💳',
        IconComponent,
        category_type: item.category_type
      };
    }).filter(item => 
      item.value > 0 && 
      item.category_type !== 'Entrada'
    );
  }, [categorySpending, categories]);

  // Calculate monthly trend from transactions
  const monthlyTrend = useMemo(() => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyData: { [key: string]: { year: number; month: number; amount: number } } = {};
    
    transactions.forEach(transaction => {
      // Ignora entradas e valores negativos (estornos/devoluções)
      if (transaction.categories?.tipo === 'Entrada' || transaction.amount <= 0) return;
      
      // Corrige formato de data inválido (202025-08-25 → 2025-08-25)
      let dateStr = transaction.transaction_date;
      if (typeof dateStr === 'string' && dateStr.match(/^\d{6}-/)) {
        dateStr = dateStr.substring(2); // Remove os 2 primeiros dígitos
      }
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthKey = `${year}-${month}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          year,
          month,
          amount: 0
        };
      }
      
      monthlyData[monthKey].amount += Math.abs(transaction.amount);
    });

    // Ordenar cronologicamente e pegar últimos 4 meses
    const result = Object.values(monthlyData)
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      })
      .slice(-4)
      .map(item => ({
        month: monthNames[item.month],
        amount: item.amount
      }));
    
    console.log('📊 Meses disponíveis:', result.length, result);
    return result;
  }, [transactions]);

  // Calculate total spent excluding income categories
  const totalSpent = categorySpending
    .filter((item: any) => item.category_type !== 'Entrada')
    .reduce((sum: number, item: any) => sum + Number(item.total_spent || 0), 0);
  const isLoading = analyticsLoading || transactionsLoading;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatCurrencyNoDecimals = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-16 sm:pb-20 md:pb-0">
        <div className="animate-pulse p-4 sm:p-6 space-y-4">
          <div className="h-6 bg-muted rounded w-48"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 sm:pb-40 md:pb-0">
      <header className="p-4 sm:p-6">
        <BackButton to="/" className="mb-3 sm:mb-4" />
        
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h1 className="text-2xl font-bold text-display">Análise de Gastos</h1>
        </div>
      </header>

      <MonthFilter 
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        showViewModeToggle={true}
      />

      <div className="px-4 sm:px-6 space-y-4 sm:space-y-6">
        {/* Total Spent Card */}
        <div className="card-nexus text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-warning/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 rounded-full bg-destructive/20 mr-3">
                <TrendingDown className="text-destructive" size={24} />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Gasto Total</h3>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-destructive text-financial mb-2">
              {formatCurrencyNoDecimals(totalSpent)}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(selectedMonth), 'MMMM yyyy', { locale: require('date-fns/locale/pt-BR').ptBR })}
            </p>
          </div>
        </div>

        {/* Spending by Category - Pie Chart */}
        <div className="card-nexus">
          <div className="flex items-center mb-3 sm:mb-4">
            <BarChart3 className="text-primary mr-2" size={18} />
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Gastos por Categoria</h3>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Gráfico */}
            <div className="flex-1 relative h-80 lg:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                    label={({ percent }) => (percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : '')}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={3} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Gasto</p>
                  <p className="text-lg sm:text-xl font-bold text-destructive text-financial">
                    {formatCurrencyNoDecimals(totalSpent)}
                  </p>
                </div>
              </div>
            </div>

            {/* Legenda lateral */}
            <div className="lg:w-64 space-y-0.5">
              <h4 className="font-semibold text-xs text-muted-foreground mb-2">Categorias</h4>
              {categoryData.map((category, index) => {
                const percentage = ((category.value / totalSpent) * 100).toFixed(1);
                return (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 py-1 px-2 rounded hover:bg-accent/30 transition-colors cursor-pointer"
                  >
                    <div 
                      className="w-3 h-3 rounded flex-shrink-0" 
                      style={{ backgroundColor: category.color }}
                    />
                    <p className="text-xs font-medium truncate flex-1 text-foreground">
                      {category.name}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {percentage}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {categoryData.length > 0 ? categoryData.map((category, index) => (
              <button
                key={index}
                onClick={() => {
                  window.location.href = `/analysis/category/${category.id}?month=${selectedMonth}`;
                }}
                className="group relative overflow-hidden"
              >
                <div className="card-nexus p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: category.color }}
                    >
                      <category.IconComponent size={24} className="text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-semibold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors">
                        {category.name}
                      </h4>
                      <p className="text-lg font-bold text-financial" style={{ color: category.color }}>
                        {formatCurrency(category.value)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {((category.value / totalSpent) * 100).toFixed(1)}% do total
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Hover effect gradient */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${category.color}, transparent)` 
                  }}
                />
              </button>
            )) : (
              <div className="col-span-2 card-nexus text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <BarChart3 size={32} className="text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium mb-2">Nenhum gasto registrado</p>
                <p className="text-sm text-muted-foreground">
                  Adicione algumas transações para ver a análise
                </p>
              </div>
            )}
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
        <div className="card-nexus mb-16 sm:mb-20">
          <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">
            Tendência dos Últimos Meses
          </h3>
          
          <div className="h-40 sm:h-48">
            <ResponsiveContainer width="100%" height={250}>
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