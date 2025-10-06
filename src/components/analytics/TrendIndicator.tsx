import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  value: number;
  trend?: 'up' | 'down' | 'neutral';
  showIcon?: boolean;
}

export const TrendIndicator = ({ value, trend, showIcon = true }: TrendIndicatorProps) => {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const determinedTrend = trend || (isPositive ? 'up' : isNegative ? 'down' : 'neutral');

  const colorClass = 
    determinedTrend === 'up' ? 'text-green-600 dark:text-green-400' :
    determinedTrend === 'down' ? 'text-red-600 dark:text-red-400' :
    'text-muted-foreground';

  const Icon = 
    determinedTrend === 'up' ? TrendingUp :
    determinedTrend === 'down' ? TrendingDown :
    Minus;

  return (
    <div className={cn("flex items-center gap-1 text-sm font-medium", colorClass)}>
      {showIcon && <Icon className="h-4 w-4" />}
      <span>{isPositive ? '+' : ''}{value.toFixed(1)}%</span>
    </div>
  );
};
