import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ViewModeToggle } from '@/components/ui/view-mode-toggle';
import MonthRangePicker from './MonthRangePicker';

// Definir tipos das props
interface MonthFilterProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  showViewModeToggle?: boolean;
  rangeMode?: boolean;
  startMonth?: string;
  endMonth?: string;
  onRangeChange?: (start: string, end: string) => void;
}

const MonthFilter: React.FC<MonthFilterProps> = ({ 
  selectedMonth, 
  onMonthChange,
  showViewModeToggle = false,
  rangeMode = false,
  startMonth,
  endMonth,
  onRangeChange
}) => {
  const [showRangePicker, setShowRangePicker] = useState(false);

  const currentMonth = format(new Date(), 'yyyy-MM-01');
  const lastMonth = format(subMonths(new Date(), 1), 'yyyy-MM-01');

  const isCurrentOrLastMonth = selectedMonth === currentMonth || selectedMonth === lastMonth;
  const isCustomRange = rangeMode && startMonth && endMonth;

  const getCustomButtonLabel = () => {
    if (isCustomRange && startMonth && endMonth) {
      try {
        const start = format(new Date(startMonth), 'MMM/yy', { locale: ptBR });
        const end = format(new Date(endMonth), 'MMM/yy', { locale: ptBR });
        return `${start} - ${end}`;
      } catch {
        return 'Personalizado';
      }
    }
    return 'Personalizado';
  };

  const handleRangeApply = (start: string, end: string) => {
    if (onRangeChange) {
      onRangeChange(start, end);
    }
  };

  return (
    <div className="px-4 sm:px-6 mb-4 sm:mb-6">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Período:</div>
          <div className="flex gap-2">
            <Button
              variant={selectedMonth === currentMonth ? 'default' : 'outline'}
              onClick={() => onMonthChange(currentMonth)}
              size="sm"
            >
              Mês Atual
            </Button>
            <Button
              variant={selectedMonth === lastMonth ? 'default' : 'outline'}
              onClick={() => onMonthChange(lastMonth)}
              size="sm"
            >
              Mês Passado
            </Button>
            <Button
              variant={isCustomRange ? 'default' : 'outline'}
              size="sm"
              className={cn(
                isCustomRange && "border-primary"
              )}
              onClick={() => setShowRangePicker(true)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getCustomButtonLabel()}
            </Button>
          </div>
        </div>
        {showViewModeToggle && <ViewModeToggle />}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-3">
        <div className="text-sm text-muted-foreground">Período:</div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedMonth === currentMonth ? 'default' : 'outline'}
            onClick={() => onMonthChange(currentMonth)}
            size="sm"
            className="flex-1"
          >
            Mês Atual
          </Button>
            <Button
              variant={selectedMonth === lastMonth ? 'default' : 'outline'}
              onClick={() => onMonthChange(lastMonth)}
              size="sm"
              className="flex-1"
            >
              Mês Passado
            </Button>
            <Button
              variant={isCustomRange ? 'default' : 'outline'}
              size="sm"
              className={cn(
                "flex-1",
                isCustomRange && "border-primary"
              )}
              onClick={() => setShowRangePicker(true)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getCustomButtonLabel()}
            </Button>
        </div>
        {showViewModeToggle && (
          <div className="flex justify-center">
            <ViewModeToggle />
          </div>
        )}
      </div>

      <MonthRangePicker 
        open={showRangePicker}
        onOpenChange={setShowRangePicker}
        onApply={handleRangeApply}
      />
    </div>
  );
};

export default MonthFilter;
