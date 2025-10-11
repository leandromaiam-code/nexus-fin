import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format, differenceInMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthRangePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (startMonth: string, endMonth: string) => void;
}

const MonthRangePicker: React.FC<MonthRangePickerProps> = ({ open, onOpenChange, onApply }) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const [startMonth, setStartMonth] = useState<number>(currentMonth);
  const [startYear, setStartYear] = useState<number>(currentYear);
  const [endMonth, setEndMonth] = useState<number>(currentMonth);
  const [endYear, setEndYear] = useState<number>(currentYear);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    validateRange();
  }, [startMonth, startYear, endMonth, endYear]);

  const months = [
    { value: 0, label: 'Janeiro' },
    { value: 1, label: 'Fevereiro' },
    { value: 2, label: 'Março' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Maio' },
    { value: 5, label: 'Junho' },
    { value: 6, label: 'Julho' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Setembro' },
    { value: 9, label: 'Outubro' },
    { value: 10, label: 'Novembro' },
    { value: 11, label: 'Dezembro' },
  ];

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const validateRange = () => {
    const start = new Date(startYear, startMonth, 1);
    const end = new Date(endYear, endMonth, 1);
    const now = new Date(currentYear, currentMonth, 1);

    // Limpar erro primeiro
    setError('');

    if (start > now) {
      setError('Data inicial não pode ser futura');
      return false;
    }

    if (end > now) {
      setError('Data final não pode ser futura');
      return false;
    }

    if (start > end) {
      setError('Data inicial deve ser anterior à data final');
      return false;
    }

    const diff = differenceInMonths(end, start);
    if (diff > 11) {
      setError('Período máximo de 12 meses');
      return false;
    }

    return true;
  };

  const handleApply = () => {
    if (validateRange()) {
      const startMonthStr = format(new Date(startYear, startMonth, 1), 'yyyy-MM-01');
      const endMonthStr = format(new Date(endYear, endMonth, 1), 'yyyy-MM-01');
      onApply(startMonthStr, endMonthStr);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Período Personalizado</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Mês Início */}
          <div className="space-y-2">
            <Label>Mês Início</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select value={startMonth.toString()} onValueChange={(v) => setStartMonth(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={startYear.toString()} onValueChange={(v) => setStartYear(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mês Fim */}
          <div className="space-y-2">
            <Label>Mês Fim</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select value={endMonth.toString()} onValueChange={(v) => setEndMonth(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={endYear.toString()} onValueChange={(v) => setEndYear(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">⚠️ {error}</p>
            </div>
          )}

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 Máximo de 12 meses de intervalo
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleApply} disabled={!!error}>
            Aplicar Filtro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MonthRangePicker;
