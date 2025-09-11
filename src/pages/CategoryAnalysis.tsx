import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingDown, Receipt, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const CategoryAnalysis = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [selectedMonth] = useState('2025-09');

  // Mock category data based on categoryId
  const getCategoryData = (id: string) => {
    const categories: Record<string, any> = {
      '1': {
        name: 'Alimentação',
        icon: '🍽️',
        total: 1850,
        color: '#4F46E5',
        subcategories: [
          { name: 'Supermercado', value: 980, color: '#4F46E5' },
          { name: 'Restaurantes', value: 520, color: '#6366F1' },
          { name: 'Delivery', value: 350, color: '#818CF8' }
        ],
        transactions: [
          { date: '2025-09-15', description: 'Supermercado Extra', amount: 156.80, subcategory: 'Supermercado' },
          { date: '2025-09-14', description: 'iFood - Pizza', amount: 45.90, subcategory: 'Delivery' },
          { date: '2025-09-13', description: 'Restaurante Italiano', amount: 85.50, subcategory: 'Restaurantes' },
          { date: '2025-09-12', description: 'Padaria Central', amount: 24.60, subcategory: 'Supermercado' },
          { date: '2025-09-11', description: 'Uber Eats - Japonês', amount: 62.30, subcategory: 'Delivery' }
        ]
      },
      '2': {
        name: 'Transporte',
        icon: '🚗',
        total: 980,
        color: '#22C55E',
        subcategories: [
          { name: 'Combustível', value: 450, color: '#22C55E' },
          { name: 'Uber/99', value: 320, color: '#16A34A' },
          { name: 'Estacionamento', value: 210, color: '#15803D' }
        ],
        transactions: [
          { date: '2025-09-15', description: 'Posto Shell', amount: 89.50, subcategory: 'Combustível' },
          { date: '2025-09-14', description: 'Uber - Centro', amount: 18.90, subcategory: 'Uber/99' },
          { date: '2025-09-13', description: 'Estacionamento Shopping', amount: 12.00, subcategory: 'Estacionamento' },
          { date: '2025-09-12', description: '99 - Aeroporto', amount: 45.60, subcategory: 'Uber/99' },
          { date: '2025-09-11', description: 'Posto Ipiranga', amount: 78.20, subcategory: 'Combustível' }
        ]
      }
    };
    return categories[id] || categories['1'];
  };

  const categoryData = getCategoryData(categoryId || '1');

  // Mock comparison data (last 3 months)
  const monthlyComparison = [
    { month: 'Jul', amount: categoryData.total - 200 },
    { month: 'Ago', amount: categoryData.total + 150 },
    { month: 'Set', amount: categoryData.total }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{payload[0].payload.name || payload[0].payload.month}</p>
          <p className="text-primary text-financial">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="p-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/analysis')}
            className="p-2 rounded-lg hover:bg-muted transition-colors mr-2"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-display flex items-center">
              <span className="mr-2">{categoryData.icon}</span>
              {categoryData.name}
            </h1>
            <p className="text-muted-foreground">Análise Detalhada</p>
          </div>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Category Total Card */}
        <div className="card-nexus text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingDown className="text-destructive mr-2" size={24} />
            <h3 className="text-lg font-semibold text-foreground">Total da Categoria</h3>
          </div>
          <p className="text-3xl font-bold text-destructive text-financial">
            {formatCurrency(categoryData.total)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Setembro 2025</p>
        </div>

        {/* Subcategories Breakdown */}
        <div className="card-nexus">
          <div className="flex items-center mb-4">
            <PieChartIcon className="text-primary mr-2" size={20} />
            <h3 className="font-semibold text-foreground">Subcategorias</h3>
          </div>

          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData.subcategories}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {categoryData.subcategories.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Subcategory Legend */}
          <div className="space-y-2">
            {categoryData.subcategories.map((subcategory: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: subcategory.color }}
                  />
                  <span className="text-sm text-foreground">{subcategory.name}</span>
                </div>
                <span className="text-sm font-medium text-financial">
                  {formatCurrency(subcategory.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="card-nexus">
          <h3 className="font-semibold text-foreground mb-4">
            Comparativo Mensal
          </h3>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`}
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
                  fill={categoryData.color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card-nexus">
          <div className="flex items-center mb-4">
            <Receipt className="text-primary mr-2" size={20} />
            <h3 className="font-semibold text-foreground">Transações Recentes</h3>
          </div>

          <div className="space-y-3">
            {categoryData.transactions.map((transaction: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground text-sm">
                    {transaction.description}
                  </h4>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <span className="mr-2">{formatDate(transaction.date)}</span>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {transaction.subcategory}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-destructive text-financial">
                    -{formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <button className="text-primary text-sm font-medium hover:underline">
              Ver todas as transações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryAnalysis;