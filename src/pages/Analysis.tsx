import React, { useState, useMemo } from 'react';
import { BarChart3, ChevronLeft, ChevronRight, TrendingDown, Wallet, CreditCard, Utensils, Car, Home, Gamepad2, Coffee, ShoppingBag } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useCategories } from '@/hooks/useSupabaseData';
import { useAdaptiveAnalytics, useAdaptiveTransactions } from '@/hooks/useAdaptiveData';
import BackButton from '@/components/ui/back-button';
import { ViewModeToggle } from '@/components/ui/view-mode-toggle';

const Analysis = () => {
  const [selectedMonth, setSelectedMonth] = useState(8); // September (0-indexed)
  const [selectedYear] = useState(2025);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Get real data from Supabase - usando hooks adaptativos
  const currentMonthStr = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}-01`;
  const { data: analyticsData, isLoading: analyticsLoading } = useAdaptiveAnalytics(currentMonthStr);
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
      'hsl(var(--primary))',
      'hsl(var(--success))', 
      'hsl(var(--warning))', 
      'hsl(var(--destructive))',
      'hsl(var(--accent))',
      'hsl(var(--secondary))',
      '#EC4899', 
      '#10B981'
    ];
    
    return categorySpending.map((item, index) => {
      const category = categories.find(c => c.id === item.category_id);
      const IconComponent = getCategoryIcon(category?.icon_name || '', item.category_name || '');
      
      return {
        id: item.category_id,
        name: item.category_name || 'Sem categoria',
        value: Number(item.total_spent_in_category || 0),
        color: colors[index % colors.length],
        icon: category?.icon_name || '💳',
        IconComponent
      };
    }).filter(item => item.value > 0); // Filtra apenas valores positivos (despesas reais)
  }, [categorySpending, categories]);

  // Calculate monthly trend from transactions
  const monthlyTrend = useMemo(() => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyData: { [key: string]: { year: number; month: number; amount: number } } = {};
    
    transactions.forEach(transaction => {
      // Ignora apenas reembolsos/devoluções (valores negativos)
      if (transaction.amount < 0) return;
      
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

  // Calculate total from raw data BEFORE filtering (includes refunds/negatives)
  const totalSpent = categorySpending.reduce((sum: number, item: any) => sum + Number(item.total_spent || item.total_spent_in_category || 0), 0);
  const isLoading = analyticsLoading || transactionsLoading;

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
        
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center flex-1">
            <button 
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronLeft size={24} className="text-foreground" />
            </button>
            
            <div className="mx-6 text-center min-w-0 flex-1">
              <h1 className="text-2xl font-bold text-display">
                {months[selectedMonth]} {selectedYear}
              </h1>
              <p className="text-base text-muted-foreground">Análise de Gastos</p>
            </div>
            
            <button 
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronRight size={24} className="text-foreground" />
            </button>
          </div>
          <ViewModeToggle />
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-3">
          <div className="flex items-center justify-center">
            <button 
              onClick={() => navigateMonth('prev')}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronLeft size={20} className="text-foreground" />
            </button>
            
            <div className="mx-4 text-center min-w-0 flex-1">
              <h1 className="text-lg font-bold text-display">
                {months[selectedMonth]} {selectedYear}
              </h1>
              <p className="text-sm text-muted-foreground">Análise de Gastos</p>
            </div>
            
            <button 
              onClick={() => navigateMonth('next')}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronRight size={20} className="text-foreground" />
            </button>
          </div>
          <div className="flex justify-center">
            <ViewModeToggle />
          </div>
        </div>
      </header>

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
              {formatCurrency(totalSpent)}
            </p>
            <p className="text-sm text-muted-foreground">
              {months[selectedMonth]} {selectedYear}
            </p>
          </div>
        </div>

        {/* Spending by Category - Pie Chart */}
        <div className="card-nexus">
          <div className="flex items-center mb-3 sm:mb-4">
            <BarChart3 className="text-primary mr-2" size={18} />
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Gastos por Categoria</h3>
          </div>
          
          <div className="relative h-64 sm:h-80 mb-4 sm:mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                  className="sm:hidden"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={2} />
                  ))}
                </Pie>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                  className="hidden sm:block"
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
                  {formatCurrency(totalSpent)}
                </p>
              </div>
            </div>

            {/* Floating category icons around the chart */}
            {categoryData.slice(0, 6).map((category, index) => {
              const angle = (index * 60) - 90; // Distribute icons around circle
              const radius = 140; // Distance from center
              const x = 50 + (radius * Math.cos(angle * Math.PI / 180)) / 3; // Convert to percentage
              const y = 50 + (radius * Math.sin(angle * Math.PI / 180)) / 3;
              
              return (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 hidden sm:block"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-background animate-fade-in"
                    style={{ 
                      backgroundColor: category.color,
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <category.IconComponent size={20} className="text-white" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {categoryData.length > 0 ? categoryData.map((category, index) => (
              <button
                key={index}
                onClick={() => window.location.href = `/analysis/category/${category.id}`}
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