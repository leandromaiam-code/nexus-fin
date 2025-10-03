import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MonthFilter from '@/components/dashboard/MonthFilter';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import BalanceCard from '@/components/dashboard/BalanceCard';
import GoalCard from '@/components/dashboard/GoalCard';
import TransactionFeed from '@/components/dashboard/TransactionFeed';
import { DashboardSkeleton } from '@/components/ui/skeleton-loader';
import { EmptyState } from '@/components/ui/empty-state';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useUserData, useMonthlyData, usePrimaryGoal, useRecentTransactions } from '@/hooks/useSupabaseData';
import { isDiagnosticComplete } from '@/lib/diagnosticUtils';
import { AlertCircle, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM-01'));

  // Real Supabase data
  const { data: userData, isLoading: userLoading, error: userError } = useUserData();
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyData(selectedMonth);
  const { data: primaryGoal, isLoading: goalLoading } = usePrimaryGoal();
  const { data: recentTransactions, isLoading: transactionsLoading } = useRecentTransactions(20);

  const isLoading = userLoading || monthlyLoading || goalLoading || transactionsLoading;

  // Don't redirect - user should already be authenticated via ProtectedRoute

  const handleGoalDetails = (goalId?: number) => {
    if (goalId) {
      navigate(`/goal/${goalId}`);
    }
  };

  const handleViewAllTransactions = () => {
    navigate('/transactions');
  };

  const handleCreateGoal = () => {
    navigate('/goal-catalog');
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <EmptyState
          icon={AlertCircle}
          title="Erro ao carregar dados"
          description="Não conseguimos carregar seus dados. Tente novamente."
          actionLabel="Tentar Novamente"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  // Transform Supabase data to component props
  const balanceData = {
    balance: monthlyData?.balance || 0,
    income: monthlyData?.renda_base_amount || 0,
    expenses: monthlyData?.total_spent || 0
  };

  const goalData = primaryGoal ? {
    id: primaryGoal.id,
    name: primaryGoal.goal_templates?.name || primaryGoal.custom_name || 'Meta Sem Nome',
    currentAmount: primaryGoal.current_amount || 0,
    targetAmount: primaryGoal.target_amount,
    targetDate: primaryGoal.target_date
  } : null;

  const transformedTransactions = recentTransactions?.map(transaction => ({
    id: transaction.id.toString(),
    description: transaction.description || 'Sem descrição',
    amount: transaction.amount,
    categoryName: transaction.categories?.name || 'Sem categoria',
    categoryIcon: transaction.categories?.icon_name || 'circle',
    isIncome: transaction.categories?.tipo === 'Entrada' || transaction.amount < 0,
    date: transaction.transaction_date
  })) || [];

  const showDiagnosticAlert = userData && !isDiagnosticComplete(userData);

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-20 md:pb-0 animate-fade-in">
      <div className="flex items-center justify-end px-4 sm:px-6 pt-4">
        <ThemeToggle />
      </div>
      
      <DashboardHeader 
        userName={userData.full_name || 'Usuário'}
        financialArchetype={userData.financial_archetype || 'Sem arquétipo definido'}
      />
      
      {/* Diagnostic Alert */}
      {showDiagnosticAlert && (
        <div className="px-4 sm:px-6 mb-4 sm:mb-6">
          <Alert className="border-destructive bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">
                Preencha seu diagnóstico para um controle financeiro mais preciso
              </span>
              <Button 
                size="sm" 
                variant="outline"
                className="ml-3 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => navigate('/diagnostic')}
              >
                Fazer Diagnóstico
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Month Filter */}
      <MonthFilter 
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />
      
      <BalanceCard
        balance={balanceData.balance}
        income={balanceData.income}
        expenses={balanceData.expenses}
        isBalanceVisible={isBalanceVisible}
        onToggleVisibility={() => setIsBalanceVisible(!isBalanceVisible)}
      />
      
      {goalData ? (
        <GoalCard
          goalName={goalData.name}
          currentAmount={goalData.currentAmount}
          targetAmount={goalData.targetAmount}
          targetDate={goalData.targetDate}
          onViewDetails={() => handleGoalDetails(goalData.id)}
        />
      ) : (
        <div className="px-4 sm:px-6 mb-4 sm:mb-6">
          <div className="card-nexus">
            <EmptyState
              icon={({ size, className }) => (
                <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                </svg>
              )}
              title="Configure sua meta principal"
              description="Defina uma meta principal para começar a acompanhar seu progresso financeiro."
              actionLabel="Criar Meta"
              onAction={handleCreateGoal}
            />
          </div>
        </div>
      )}
      
      <TransactionFeed
        transactions={transformedTransactions}
        onViewAll={handleViewAllTransactions}
      />
    </div>
  );
};

export default Dashboard;