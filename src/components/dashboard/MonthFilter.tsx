import React, { useState } from 'react';
import { ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ViewModeToggle } from '@/components/ui/view-mode-toggle';

// Definir tipos das props
interface MonthFilterProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  showViewModeToggle?: boolean;
}

const MonthFilter: React.FC<MonthFilterProps> = ({ 
  selectedMonth, 
  onMonthChange,
  showViewModeToggle = false 
}) => {
  const [date, setDate] = useState<Date>(new Date(selectedMonth));

  const currentMonth = format(new Date(), 'yyyy-MM-01');
  const lastMonth = format(subMonths(new Date(), 1), 'yyyy-MM-01');

  const isCurrentOrLastMonth = selectedMonth === currentMonth || selectedMonth === lastMonth;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      const formattedMonth = format(date, 'yyyy-MM-01');
      onMonthChange(formattedMonth);
    }
  };

  const getDisplayMonth = () => {
    try {
      return format(new Date(selectedMonth), 'MMMM yyyy', { locale: ptBR });
    } catch {
      return 'Selecione um mês';
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={!isCurrentOrLastMonth ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    !isCurrentOrLastMonth && "border-primary"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {!isCurrentOrLastMonth ? getDisplayMonth() : 'Personalizado'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  disabled={(date) =>
                    date > new Date() || date < new Date("2020-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={!isCurrentOrLastMonth ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  "flex-1",
                  !isCurrentOrLastMonth && "border-primary"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {!isCurrentOrLastMonth ? getDisplayMonth() : 'Personalizado'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={(date) =>
                  date > new Date() || date < new Date("2020-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        {showViewModeToggle && (
          <div className="flex justify-center">
            <ViewModeToggle />
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthFilter;
