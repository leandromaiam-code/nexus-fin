import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateFamilyMember } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';

interface QuotaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  member: any;
}

const QuotaManager = ({ isOpen, onClose, member }: QuotaManagerProps) => {
  const [cotaMensal, setCotaMensal] = useState('');
  const updateMember = useUpdateFamilyMember();

  useEffect(() => {
    if (member) {
      setCotaMensal(member.cota_mensal?.toString() || '');
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMember.mutateAsync({
        id: member.id,
        data: {
          cota_mensal: Number(cotaMensal),
        },
      });

      toast.success('Cota atualizada com sucesso!');
      onClose();
    } catch (error) {
      toast.error('Erro ao atualizar cota');
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Cota Mensal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="member">Membro</Label>
            <Input
              id="member"
              value={member?.users?.full_name || ''}
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="cotaMensal">Cota Mensal</Label>
            <Input
              id="cotaMensal"
              type="number"
              step="0.01"
              value={cotaMensal}
              onChange={(e) => setCotaMensal(e.target.value)}
              placeholder="R$ 0,00"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Defina o valor máximo que este membro pode gastar por mês
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMember.isPending}>
              {updateMember.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuotaManager;
