import React from 'react';
import { cn } from '@/lib/utils';

interface GaugeChartProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

export const GaugeChart = ({ value, max = 100, size = 'md', showLabel = true, label }: GaugeChartProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  const isOver = value > max;
  
  const color = 
    percentage < 60 ? 'text-green-600 dark:text-green-400' :
    percentage < 85 ? 'text-yellow-600 dark:text-yellow-400' :
    'text-red-600 dark:text-red-400';

  const strokeColor = 
    percentage < 60 ? 'stroke-green-600 dark:stroke-green-400' :
    percentage < 85 ? 'stroke-yellow-600 dark:stroke-yellow-400' :
    'stroke-red-600 dark:stroke-red-400';

  const sizeMap = {
    sm: { width: 80, strokeWidth: 6, fontSize: 'text-xl' },
    md: { width: 120, strokeWidth: 8, fontSize: 'text-3xl' },
    lg: { width: 160, strokeWidth: 10, fontSize: 'text-4xl' },
  };

  const { width, strokeWidth, fontSize } = sizeMap[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width, height: width }}>
        <svg width={width} height={width} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("transition-all duration-500", strokeColor)}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", fontSize, color)}>
            {Math.round(percentage)}%
          </span>
          {isOver && <span className="text-xs text-muted-foreground">excedido</span>}
        </div>
      </div>
      {showLabel && label && (
        <p className="text-sm text-muted-foreground text-center">{label}</p>
      )}
    </div>
  );
};
