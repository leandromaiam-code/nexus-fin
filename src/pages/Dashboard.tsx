import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BalanceCard from '@/components/dashboard/BalanceCard';
import GoalCard from '@/components/dashboard/GoalCard';
import TransactionFeed from '@/components/dashboard/TransactionFeed';
import { DashboardSkeleton } from '@/components/ui/skeleton-loader';
import { EmptyState } from '@/components/ui/empty-state';
import { useUserData, useMonthlyData, usePrimaryGoal, useRecentTransactions } from '@/hooks/useSupabaseData';
import { AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  // Real Supabase data
  const { data: userData, isLoading: userLoading, error: userError } = useUserData();
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyData();
  const { data: primaryGoal, isLoading: goalLoading } = usePrimaryGoal();
  const { data: recentTransactions, isLoading: transactionsLoading } = useRecentTransactions(4);

  const isLoading = userLoading || monthlyLoading || goalLoading || transactionsLoading;

  // If user is not authenticated or doesn't exist, redirect to onboarding
  if (userError && !userLoading) {
    navigate('/onboarding');
    return null;
  }

  const handleGoalDetails = (goalId?: number) => {
    if (goalId) {
      navigate(`/goal/${goalId}`);
    }
  };

  const handleViewAllTransactions = () => {
    navigate('/analysis');
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
    amount: Math.abs(transaction.amount),
    categoryName: transaction.categories?.name || 'Sem categoria',
    categoryIcon: transaction.categories?.icon_name || 'circle',
    isIncome: transaction.amount > 0,
    date: transaction.transaction_date
  })) || [];

  return (
    <div className="min-h-screen bg-background pb-20 animate-fade-in">
      <DashboardHeader 
        userName={userData.full_name || 'Usuário'}
        financialArchetype={userData.financial_archetype || 'Sem arquétipo definido'}
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
        <div className="px-6 mb-6">
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