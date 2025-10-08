import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// 1. Importe os dois hooks necessários
import { useCreateBudget, useParentCategories } from "@/hooks/useSupabaseData";

// 2. Remova 'availableCategories' das props, pois o componente buscará seus próprios dados
interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: string;
}

const AddBudgetModal = ({ isOpen, onClose, month }: AddBudgetModalProps) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [value, setValue] = useState("");

  const createBudget = useCreateBudget();
  // 3. Chame o novo hook para buscar as categorias pai
  const { data: parentCategories, isLoading: isLoadingCategories } = useParentCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const categoryId = parseInt(selectedCategory);
    const amount = parseFloat(value);

    if (!categoryId || amount <= 0) {
      return;
    }

    try {
      await createBudget.mutateAsync({
        category_id: categoryId,
        valor_orcado: amount,
        mes_ano: month,
      });

      setSelectedCategory("");
      setValue("");
      onClose();
    } catch (error: any) {
      console.error("Erro detalhado ao criar orçamento:", error);
      const message = error.message || "Erro desconhecido ao criar orçamento";
      alert(`Erro ao criar orçamento: ${message}`);
    }
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
            <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isLoadingCategories}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingCategories ? "Carregando..." : "Selecione uma categoria"} />
              </SelectTrigger>
              <SelectContent>
                {/* 4. Use a nova variável 'parentCategories' para renderizar a lista */}
                {parentCategories?.map((cat) => (
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
              {createBudget.isPending ? "Salvando..." : "Criar Orçamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBudgetModal;
