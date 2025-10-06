import React from 'react';
import { TrendingUp, PiggyBank, CreditCard, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import BackButton from '@/components/ui/back-button';

const WealthEvolution = () => {

  // Mock data for wealth evolution (static for prototype)
  const wealthData = [
    { month: 'Jan 2024', assets: 25000, liabilities: 8000, netWorth: 17000 },
    { month: 'Fev 2024', assets: 26500, liabilities: 7800, netWorth: 18700 },
    { month: 'Mar 2024', assets: 28200, liabilities: 7600, netWorth: 20600 },
    { month: 'Abr 2024', assets: 29800, liabilities: 7400, netWorth: 22400 },
    { month: 'Mai 2024', assets: 31500, liabilities: 7200, netWorth: 24300 },
    { month: 'Jun 2024', assets: 33200, liabilities: 7000, netWorth: 26200 },
    { month: 'Jul 2024', assets: 35000, liabilities: 6800, netWorth: 28200 },
    { month: 'Ago 2024', assets: 36800, liabilities: 6600, netWorth: 30200 },
    { month: 'Set 2024', assets: 38500, liabilities: 6400, netWorth: 32100 },
    { month: 'Out 2024', assets: 40200, liabilities: 6200, netWorth: 34000 },
    { month: 'Nov 2024', assets: 42000, liabilities: 6000, netWorth: 36000 },
    { month: 'Dez 2024', assets: 43800, liabilities: 5800, netWorth: 38000 }
  ];

  const currentData = wealthData[wealthData.length - 1];
  const previousData = wealthData[wealthData.length - 2];
  const monthlyGrowth = currentData.netWorth - previousData.netWorth;
  const growthPercentage = ((monthlyGrowth / previousData.netWorth) * 100);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="text-foreground font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-financial" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="p-6">
        <BackButton to="/analysis" className="mb-4" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-display">Evolução Patrimonial</h1>
          <p className="text-muted-foreground">Acompanhe o crescimento do seu patrimônio</p>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Current Net Worth Card */}
        <div className="card-nexus text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="text-success mr-2" size={24} />
            <h3 className="text-lg font-semibold text-foreground">Patrimônio Líquido Atual</h3>
          </div>
          <p className="text-4xl font-bold text-success text-financial mb-2">
            {formatCurrency(currentData.netWorth)}
          </p>
          <div className="flex items-center justify-center text-sm">
            <span className="text-muted-foreground mr-2">Variação mensal:</span>
            <span className={`font-medium ${monthlyGrowth >= 0 ? 'text-success' : 'text-destructive'}`}>
              {monthlyGrowth >= 0 ? '+' : ''}{formatCurrency(monthlyGrowth)} 
              ({growthPercentage >= 0 ? '+' : ''}{growthPercentage.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Assets vs Liabilities Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-nexus text-center">
            <div className="flex items-center justify-center mb-2">
              <PiggyBank className="text-primary mr-2" size={20} />
              <h4 className="font-semibold text-foreground">Ativos</h4>
            </div>
            <p className="text-2xl font-bold text-primary text-financial">
              {formatCurrency(currentData.assets)}
            </p>
          </div>
          
          <div className="card-nexus text-center">
            <div className="flex items-center justify-center mb-2">
              <CreditCard className="text-warning mr-2" size={20} />
              <h4 className="font-semibold text-foreground">Passivos</h4>
            </div>
            <p className="text-2xl font-bold text-warning text-financial">
              {formatCurrency(currentData.liabilities)}
            </p>
          </div>
        </div>

        {/* Net Worth Evolution Chart */}
        <div className="card-nexus">
          <div className="flex items-center mb-4">
            <BarChart3 className="text-primary mr-2" size={20} />
            <h3 className="font-semibold text-foreground">Evolução do Patrimônio Líquido</h3>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={wealthData}>
                <defs>
                  <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="netWorth" 
                  stroke="#22C55E" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#netWorthGradient)"
                  name="Patrimônio Líquido"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assets vs Liabilities Comparison */}
        <div className="card-nexus">
          <h3 className="font-semibold text-foreground mb-4">
            Comparativo: Ativos vs Passivos
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="assets" 
                  stroke="#4F46E5" 
                  strokeWidth={3}
                  dot={{ fill: '#4F46E5', strokeWidth: 2, r: 3 }}
                  name="Ativos"
                />
                <Line 
                  type="monotone" 
                  dataKey="liabilities" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                  name="Passivos"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insights Card */}
        <div className="card-nexus">
          <h3 className="font-semibold text-foreground mb-4">Insights</h3>
          
          <div className="space-y-3">
            <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-sm text-success font-medium">✅ Crescimento Consistente</p>
              <p className="text-xs text-muted-foreground mt-1">
                Seu patrimônio líquido cresceu {((currentData.netWorth / wealthData[0].netWorth - 1) * 100).toFixed(1)}% em 12 meses
              </p>
            </div>
            
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary font-medium">📈 Redução de Dívidas</p>
              <p className="text-xs text-muted-foreground mt-1">
                Seus passivos diminuíram {formatCurrency(wealthData[0].liabilities - currentData.liabilities)} este ano
              </p>
            </div>
            
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="text-sm text-warning font-medium">🎯 Meta Sugerida</p>
              <p className="text-xs text-muted-foreground mt-1">
                Continue este ritmo para atingir R$ 50.000 em patrimônio líquido até o final de 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WealthEvolution;