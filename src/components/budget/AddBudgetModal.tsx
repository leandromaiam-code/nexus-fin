import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateBudget } from '@/hooks/useSupabaseData';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCategories: any[];
  month: string;
}

const AddBudgetModal = ({ isOpen, onClose, availableCategories, month }: AddBudgetModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [value, setValue] = useState('');

  const createBudget = useCreateBudget();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryId = parseInt(selectedCategory);
    const amount = parseFloat(value);

    if (!categoryId || amount <= 0) {
      return;
    }

    createBudget.mutate(
      {
        category_id: categoryId,
        valor_orcado: amount,
        mes_ano: month,
      },
      {
        onSuccess: () => {
          setSelectedCategory('');
          setValue('');
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Orçamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Valor Orçado</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="R$ 0,00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createBudget.isPending}>
              {createBudget.isPending ? 'Salvando...' : 'Criar Orçamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBudgetModal;
