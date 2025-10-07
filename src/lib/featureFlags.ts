import { PlanType } from '@/hooks/useSubscription';

export interface PlanFeatures {
  maxAccounts: number;
  maxTransactionsPerMonth: number;
  aiCategorizationLimit: number;
  familyMembers: number;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  customCategories: boolean;
  exportData: boolean;
  budgetAlerts: boolean;
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  free: {
    maxAccounts: 2,
    maxTransactionsPerMonth: 100,
    aiCategorizationLimit: 10,
    familyMembers: 0,
    advancedAnalytics: false,
    prioritySupport: false,
    customCategories: false,
    exportData: false,
    budgetAlerts: false,
  },
  plus: {
    maxAccounts: 5,
    maxTransactionsPerMonth: Infinity,
    aiCategorizationLimit: Infinity,
    familyMembers: 0,
    advancedAnalytics: true,
    prioritySupport: false,
    customCategories: true,
    exportData: true,
    budgetAlerts: true,
  },
  premium: {
    maxAccounts: Infinity,
    maxTransactionsPerMonth: Infinity,
    aiCategorizationLimit: Infinity,
    familyMembers: 6,
    advancedAnalytics: true,
    prioritySupport: true,
    customCategories: true,
    exportData: true,
    budgetAlerts: true,
  },
};

export const canUseFeature = (
  planType: PlanType | undefined,
  feature: keyof PlanFeatures
): boolean => {
  if (!planType) return PLAN_FEATURES.free[feature] as boolean;
  return PLAN_FEATURES[planType][feature] as boolean;
};

export const getFeatureLimit = (
  planType: PlanType | undefined,
  feature: keyof PlanFeatures
): number => {
  if (!planType) return PLAN_FEATURES.free[feature] as number;
  return PLAN_FEATURES[planType][feature] as number;
};
