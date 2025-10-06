import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreatePaymentAccount } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACCOUNT_TYPES = [
  'Conta Corrente',
  'Poupança',
  'Cartão de Crédito',
  'Dinheiro',
];

const ACCOUNT_COLORS = [
  { name: 'Azul', value: '#6366F1' },
  { name: 'Verde', value: '#10B981' },
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Laranja', value: '#F59E0B' },
  { name: 'Vermelho', value: '#EF4444' },
];

const AddAccountModal = ({ isOpen, onClose }: AddAccountModalProps) => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<string>('Conta Corrente');
  const [saldoInicial, setSaldoInicial] = useState('');
  const [diaFechamento, setDiaFechamento] = useState('');
  const [cor, setCor] = useState('#6366F1');
  const createAccount = useCreatePaymentAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast.error('Por favor, informe o nome da conta');
      return;
    }

    try {
      await createAccount.mutateAsync({
        nome,
        tipo,
        saldo_inicial: saldoInicial ? Number(saldoInicial) : 0,
        dia_fechamento_fatura: tipo === 'Cartão de Crédito' && diaFechamento 
          ? Number(diaFechamento) 
          : undefined,
        icone: 'wallet',
        cor,
      });

      toast.success('Conta adicionada com sucesso!');
      onClose();
      
      // Reset form
      setNome('');
      setTipo('Conta Corrente');
      setSaldoInicial('');
      setDiaFechamento('');
      setCor('#6366F1');
    } catch (error) {
      toast.error('Erro ao adicionar conta');
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Conta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome da Conta</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Nubank, Itaú, Carteira"
            />
          </div>

          <div>
            <Label htmlFor="tipo">Tipo de Conta</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="saldoInicial">Saldo Inicial</Label>
            <Input
              id="saldoInicial"
              type="number"
              step="0.01"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(e.target.value)}
              placeholder="R$ 0,00"
            />
          </div>

          {tipo === 'Cartão de Crédito' && (
            <div>
              <Label htmlFor="diaFechamento">Dia de Fechamento da Fatura</Label>
              <Input
                id="diaFechamento"
                type="number"
                min="1"
                max="31"
                value={diaFechamento}
                onChange={(e) => setDiaFechamento(e.target.value)}
                placeholder="Ex: 10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Dia do mês em que a fatura fecha
              </p>
            </div>
          )}

          <div>
            <Label>Cor de Identificação</Label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {ACCOUNT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    cor === color.value ? 'border-primary scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setCor(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createAccount.isPending}>
              {createAccount.isPending ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountModal;
