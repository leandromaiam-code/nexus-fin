import React from 'react';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MonthFilterProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const MonthFilter: React.FC<MonthFilterProps> = ({ selectedMonth, onMonthChange }) => {
  const currentMonth = format(new Date(), 'yyyy-MM-01');
  const lastMonth = format(subMonths(new Date(), 1), 'yyyy-MM-01');

  const isCurrentMonth = selectedMonth === currentMonth;
  const isLastMonth = selectedMonth === lastMonth;
  const isCustom = !isCurrentMonth && !isLastMonth;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onMonthChange(format(date, 'yyyy-MM-01'));
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
      <div className="card-nexus py-3 px-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground mr-2">Período:</span>
          
          <Button
            variant={isCurrentMonth ? "default" : "outline"}
            size="sm"
            onClick={() => onMonthChange(currentMonth)}
            className="text-xs sm:text-sm"
          >
            Mês Atual
          </Button>
          
          <Button
            variant={isLastMonth ? "default" : "outline"}
            size="sm"
            onClick={() => onMonthChange(lastMonth)}
            className="text-xs sm:text-sm"
          >
            Mês Passado
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={isCustom ? "default" : "outline"}
                size="sm"
                className={cn(
                  "text-xs sm:text-sm",
                  isCustom && "gap-2"
                )}
              >
                <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                {isCustom ? getDisplayMonth() : "Personalizado"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={new Date(selectedMonth)}
                onSelect={handleDateSelect}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};

export default MonthFilter;
