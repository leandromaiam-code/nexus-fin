import React, { useState, useEffect } from 'react';
import { Target, Plus } from 'lucide-react';
import { NexusButton } from '@/components/ui/nexus-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface BudgetSetupProps {
  budgetData: any[];
  onDataChange: (data: any[]) => void;
}

const BudgetSetup: React.FC<BudgetSetupProps> = ({ budgetData, onDataChange }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [valor, setValor] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${user?.id}`)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleAddBudget = async () => {
    if (!selectedCategory || !valor || !user?.id) {
      toast({
        title: "Erro",
        description: "Selecione uma categoria e digite um valor",
        variant: "destructive"
      });
      return;
    }

    // Verificar se já existe orçamento para esta categoria
    if (budgetData.some(b => b.category_id === parseInt(selectedCategory))) {
      toast({
        title: "Erro",
        description: "Já existe um orçamento para esta categoria",
        variant: "destructive"
      });
      return;
    }

    setIsAdding(true);
    try {
      // Criar orçamento para o mês atual
      const mesAtual = new Date();
      mesAtual.setDate(1); // Primeiro dia do mês
      const mesAnoStr = mesAtual.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('orcamentos' as any)
        .insert({
          user_id: user.id,
          category_id: parseInt(selectedCategory),
          valor_orcado: parseFloat(valor),
          mes_ano: mesAnoStr
        } as any)
        .select('*, categories(*)')
        .single();

      if (error) throw error;

      onDataChange([...budgetData, data]);
      
      // Limpar form
      setSelectedCategory('');
      setValor('');
      
      toast({
        title: "Orçamento adicionado!",
        description: "O orçamento foi configurado com sucesso."
      });
    } catch (error: any) {
      console.error('Erro ao adicionar orçamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o orçamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const availableCategories = categories.filter(
    cat => !budgetData.some(b => b.category_id === cat.id)
  );

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-display mb-2">
          Orçamento Inicial
        </h2>
        <p className="text-muted-foreground">
          Defina quanto deseja gastar em cada categoria
        </p>
      </div>

      {/* Form para adicionar orçamento */}
      <div className="card-nexus">
        <h3 className="font-semibold text-foreground mb-4 flex items-center">
          <Plus className="text-primary mr-2" size={20} />
          Adicionar Orçamento
        </h3>

        {isLoadingCategories ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Carregando categorias...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="category" className="text-sm font-medium text-foreground mb-2 block">
                Categoria *
              </Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
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

            <div>
              <Label htmlFor="budget-value" className="text-sm font-medium text-foreground mb-2 block">
                Valor Mensal (R$) *
              </Label>
              <Input
                id="budget-value"
                type="number"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>

            <NexusButton
              onClick={handleAddBudget}
              disabled={!selectedCategory || !valor || isAdding}
              className="w-full"
            >
              {isAdding ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Adicionando...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Plus size={18} className="mr-2" />
                  Adicionar Orçamento
                </div>
              )}
            </NexusButton>
          </div>
        )}
      </div>

      {/* Lista de orçamentos adicionados */}
      {budgetData.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">
            Orçamentos Configurados ({budgetData.length})
          </h3>
          <div className="space-y-2">
            {budgetData.map((budget) => (
              <div
                key={budget.id}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="text-primary" size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {budget.categories?.name || 'Categoria'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Orçamento mensal
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    R$ {parseFloat(budget.valor_orcado).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {budgetData.length === 0 && (
        <div className="bg-muted/30 border border-border rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum orçamento configurado ainda. Adicione pelo menos um orçamento para continuar.
          </p>
        </div>
      )}

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <h4 className="font-semibold text-primary mb-2">
          💡 Dica
        </h4>
        <p className="text-sm text-muted-foreground">
          Configure orçamentos realistas baseados em seus gastos anteriores. 
          Você poderá ajustar e adicionar mais orçamentos depois.
        </p>
      </div>
    </div>
  );
};

export default BudgetSetup;
