import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BalanceCard from '@/components/dashboard/BalanceCard';
import GoalCard from '@/components/dashboard/GoalCard';
import TransactionFeed from '@/components/dashboard/TransactionFeed';

const Dashboard = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  // Mock data - In real app, this would come from Supabase
  const userdata = {
    fullName: "Maria Silva",
    financialArchetype: "Planejadora Estratégica"
  };

  const monthlyData = {
    balance: 2850.50,
    income: 8500.00,
    expenses: 5649.50
  };

  const primaryGoal = {
    name: "Reserva de Emergência",
    currentAmount: 12500.00,
    targetAmount: 25000.00,
    targetDate: "2025-12-31"
  };

  const recentTransactions = [
    {
      id: "1",
      description: "Supermercado Extra",
      amount: 235.80,
      categoryName: "Alimentação",
      categoryIcon: "food",
      isIncome: false,
      date: "2025-09-08"
    },
    {
      id: "2", 
      description: "Freelance Design",
      amount: 1200.00,
      categoryName: "Renda Extra",
      categoryIcon: "shopping",
      isIncome: true,
      date: "2025-09-07"
    },
    {
      id: "3",
      description: "Combustível",
      amount: 180.00,
      categoryName: "Transporte", 
      categoryIcon: "car",
      isIncome: false,
      date: "2025-09-06"
    },
    {
      id: "4",
      description: "Farmácia",
      amount: 89.50,
      categoryName: "Saúde",
      categoryIcon: "health", 
      isIncome: false,
      date: "2025-09-05"
    }
  ];

  const handleGoalDetails = () => {
    // Navigate to goal details
    console.log("Navigate to goal details");
  };

  const handleViewAllTransactions = () => {
    // Navigate to full transaction list
    console.log("Navigate to all transactions");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <DashboardHeader 
        userName={userdata.fullName}
        financialArchetype={userdata.financialArchetype}
      />
      
      <BalanceCard
        balance={monthlyData.balance}
        income={monthlyData.income}
        expenses={monthlyData.expenses}
        isBalanceVisible={isBalanceVisible}
        onToggleVisibility={() => setIsBalanceVisible(!isBalanceVisible)}
      />
      
      <GoalCard
        goalName={primaryGoal.name}
        currentAmount={primaryGoal.currentAmount}
        targetAmount={primaryGoal.targetAmount}
        targetDate={primaryGoal.targetDate}
        onViewDetails={handleGoalDetails}
      />
      
      <TransactionFeed
        transactions={recentTransactions}
        onViewAll={handleViewAllTransactions}
      />
    </div>
  );
};

export default Dashboard;