import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, TrendingUp, RefreshCw, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUserData } from '@/hooks/useSupabaseData';
import { NexusButton } from '@/components/ui/nexus-button';
import { Skeleton } from '@/components/ui/skeleton';

const MyDiagnostic = () => {
  const navigate = useNavigate();
  const { data: userData, isLoading } = useUserData();

  // Mock data for base income variation (historical data)
  const baseIncomeHistory = [
    { month: 'Jan 2024', amount: 4200 },
    { month: 'Fev 2024', amount: 4350 },
    { month: 'Mar 2024', amount: 4280 },
    { month: 'Abr 2024', amount: 4450 },
    { month: 'Mai 2024', amount: 4380 },
    { month: 'Jun 2024', amount: 4520 },
    { month: 'Jul 2024', amount: 4460 },
    { month: 'Ago 2024', amount: 4600 },
    { month: 'Set 2024', amount: 4550 },
    { month: 'Out 2024', amount: 4680 },
    { month: 'Nov 2024', amount: 4620 },
    { month: 'Dez 2024', amount: 4750 }
  ];

  const archetypeData = {
    'planejadora_estrategica': {
      name: 'Planejadora Estratégica',
      description: 'Você tem uma visão de longo prazo e planeja cuidadosamente seus gastos e investimentos.',
      icon: '🎯',
      color: '#4F46E5',
      characteristics: [
        'Foco em metas de longo prazo',
        'Planeja gastos com antecedência',
        'Pesquisa antes de investir',
        'Controla orçamento rigorosamente'
      ],
      tips: [
        'Continue desenvolvendo seus planos financeiros',
        'Diversifique seus investimentos gradualmente',
        'Revise suas metas a cada 6 meses'
      ]
    },
    'conservadora_prudente': {
      name: 'Conservadora Prudente',
      description: 'Você prefere segurança e estabilidade, evitando riscos desnecessários.',
      icon: '🛡️',
      color: '#22C55E',
      characteristics: [
        'Prioriza segurança financeira',
        'Evita investimentos de alto risco',
        'Mantém reserva de emergência',
        'Gasta de forma comedida'
      ],
      tips: [
        'Considere diversificar gradualmente',
        'Explore renda fixa com rentabilidade maior',
        'Mantenha sua disciplina de poupança'
      ]
    },
    'equilibrada_flexivel': {
      name: 'Equilibrada Flexível',
      description: 'Você balanceia bem entre economia e gastos, adaptando-se às situações.',
      icon: '⚖️',
      color: '#F59E0B',
      characteristics: [
        'Equilibra poupança e gastos',
        'Adapta-se a mudanças financeiras',
        'Investe de forma moderada',
        'Flexível com o orçamento'
      ],
      tips: [
        'Defina limites claros para gastos variáveis',
        'Automatize sua poupança',
        'Monitore seu progresso mensalmente'
      ]
    }
  };

  const currentArchetype = archetypeData[userData?.financial_archetype as keyof typeof archetypeData] || archetypeData['equilibrada_flexivel'];
  const currentBaseIncome = userData?.renda_base_amount || baseIncomeHistory[baseIncomeHistory.length - 1].amount;
  const previousBaseIncome = baseIncomeHistory[baseIncomeHistory.length - 2].amount;
  const incomeVariation = currentBaseIncome - previousBaseIncome;
  const variationPercentage = ((incomeVariation / previousBaseIncome) * 100);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleRecalibrate = () => {
    // TODO: Integrate with n8n webhook to start-onboarding
    console.log("Triggering diagnostic recalibration...");
    navigate('/diagnostic');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{label}</p>
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
      <div className="min-h-screen bg-background pb-20">
        <header className="p-6">
          <div className="flex items-center mb-4">
            <Skeleton className="w-6 h-6 mr-4" />
            <Skeleton className="w-48 h-8" />
          </div>
        </header>
        <div className="px-6 space-y-6">
          <Skeleton className="w-full h-40" />
          <Skeleton className="w-full h-64" />
          <Skeleton className="w-full h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="p-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 rounded-lg hover:bg-muted transition-colors mr-2"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-display">Meu Diagnóstico</h1>
            <p className="text-muted-foreground">Seu perfil e evolução financeira</p>
          </div>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Financial Archetype Card */}
        <div className="card-nexus">
          <div className="flex items-center mb-4">
            <Brain className="text-primary mr-2" size={24} />
            <h3 className="text-lg font-semibold text-foreground">Seu Arquétipo Financeiro</h3>
          </div>

          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{currentArchetype.icon}</div>
            <h2 className="text-2xl font-bold text-display mb-2">
              {currentArchetype.name}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {currentArchetype.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                Características
              </h4>
              <ul className="space-y-2">
                {currentArchetype.characteristics.map((char, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start">
                    <span className="text-primary mr-2">•</span>
                    {char}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center">
                <div className="w-2 h-2 bg-success rounded-full mr-2" />
                Dicas Personalizadas
              </h4>
              <ul className="space-y-2">
                {currentArchetype.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start">
                    <span className="text-success mr-2">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Current Base Income Card */}
        <div className="card-nexus">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <TrendingUp className="text-primary mr-2" size={20} />
              <h3 className="font-semibold text-foreground">Renda Base Atual</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary text-financial">
                {formatCurrency(currentBaseIncome)}
              </p>
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground mr-2">Variação:</span>
                <span className={`font-medium ${incomeVariation >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {incomeVariation >= 0 ? '+' : ''}{formatCurrency(incomeVariation)} 
                  ({variationPercentage >= 0 ? '+' : ''}{variationPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Base Income Evolution Chart */}
        <div className="card-nexus">
          <div className="flex items-center mb-4">
            <BarChart3 className="text-primary mr-2" size={20} />
            <h3 className="font-semibold text-foreground">Variação da Renda Base</h3>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={baseIncomeHistory}>
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
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#4F46E5" 
                  strokeWidth={3}
                  dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#4F46E5', strokeWidth: 2, fill: '#ffffff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-primary font-medium">
              📊 Análise: Sua renda base apresenta crescimento de {((currentBaseIncome / baseIncomeHistory[0].amount - 1) * 100).toFixed(1)}% nos últimos 12 meses
            </p>
          </div>
        </div>

        {/* Diagnostic Summary & Actions */}
        <div className="card-nexus">
          <h3 className="font-semibold text-foreground mb-4">Resumo do Diagnóstico</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Perfil</p>
              <p className="font-semibold text-primary">{currentArchetype.name}</p>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Renda Base</p>
              <p className="font-semibold text-success text-financial">
                {formatCurrency(currentBaseIncome)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-foreground mb-1">
                📝 <strong>Última Atualização:</strong> Dezembro 2024
              </p>
              <p className="text-xs text-muted-foreground">
                Seus dados financeiros foram analisados com base nas suas respostas mais recentes
              </p>
            </div>

            <NexusButton 
              onClick={handleRecalibrate}
              className="w-full"
              variant="outline"
            >
              <RefreshCw size={16} className="mr-2" />
              Recalibrar Diagnóstico
            </NexusButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyDiagnostic;