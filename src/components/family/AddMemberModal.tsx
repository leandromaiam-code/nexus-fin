import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateFamilyMember } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: number;
}

const AddMemberModal = ({ isOpen, onClose, familyId }: AddMemberModalProps) => {
  const [userId, setUserId] = useState('');
  const [papel, setPapel] = useState<string>('Dependente');
  const [cotaMensal, setCotaMensal] = useState('');
  const createMember = useCreateFamilyMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim()) {
      toast.error('Por favor, informe o ID do usuário');
      return;
    }

    try {
      await createMember.mutateAsync({
        user_id: Number(userId),
        familia_id: familyId,
        papel,
        cota_mensal: cotaMensal ? Number(cotaMensal) : undefined,
      });

      toast.success('Membro adicionado com sucesso!');
      onClose();
      setUserId('');
      setPapel('Dependente');
      setCotaMensal('');
    } catch (error: any) {
      console.error('Erro detalhado ao adicionar membro:', error);
      const message = error.message || 'Erro desconhecido ao adicionar membro';
      toast.error(`Erro ao adicionar membro: ${message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Membro</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userId">ID do Usuário</Label>
            <Input
              id="userId"
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Digite o ID do usuário"
            />
            <p className="text-xs text-muted-foreground mt-1">
              O usuário deve estar cadastrado no sistema
            </p>
          </div>

          <div>
            <Label htmlFor="papel">Papel</Label>
            <Select value={papel} onValueChange={setPapel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cônjuge">Cônjuge</SelectItem>
                <SelectItem value="Dependente">Dependente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cotaMensal">Cota Mensal (opcional)</Label>
            <Input
              id="cotaMensal"
              type="number"
              step="0.01"
              value={cotaMensal}
              onChange={(e) => setCotaMensal(e.target.value)}
              placeholder="R$ 0,00"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMember.isPending}>
              {createMember.isPending ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberModal;
