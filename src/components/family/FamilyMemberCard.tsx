import { useState } from 'react';
import { Edit2, Trash2, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDeleteFamilyMember } from '@/hooks/useSupabaseData';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import QuotaManager from './QuotaManager';

interface FamilyMemberCardProps {
  member: any;
  isResponsavel: boolean;
}

const FamilyMemberCard = ({ member, isResponsavel }: FamilyMemberCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditQuotaOpen, setIsEditQuotaOpen] = useState(false);
  const deleteMember = useDeleteFamilyMember();

  const handleDelete = async () => {
    try {
      await deleteMember.mutateAsync(member.id);
      toast.success('Membro removido com sucesso');
    } catch (error) {
      toast.error('Erro ao remover membro');
    }
  };

  const cotaMensal = Number(member.cota_mensal) || 0;
  const gastoAtual = 0; // TODO: Calcular gastos reais do membro
  const percentualGasto = cotaMensal > 0 ? (gastoAtual / cotaMensal) * 100 : 0;

  const getPapelColor = (papel: string) => {
    switch (papel) {
      case 'Responsável':
        return 'text-primary';
      case 'Cônjuge':
        return 'text-accent-foreground';
      case 'Dependente':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {member.users?.full_name || member.users?.phone_number || 'Usuário sem nome'}
                </h3>
                <p className={`text-sm font-medium ${getPapelColor(member.papel)}`}>
                  {member.papel}
                </p>
              </div>
            </div>

            {isResponsavel && member.papel !== 'Responsável' && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditQuotaOpen(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Cota Mensal</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(cotaMensal)}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Gasto Atual</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(gastoAtual)}
                </span>
              </div>
              <Progress value={percentualGasto} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {percentualGasto.toFixed(0)}% utilizado
              </p>
            </div>

            {cotaMensal > gastoAtual && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Disponível</p>
                <p className="text-sm font-semibold text-success">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(cotaMensal - gastoAtual)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {member.users?.full_name || member.users?.phone_number || 'este membro'} da família?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <QuotaManager
        isOpen={isEditQuotaOpen}
        onClose={() => setIsEditQuotaOpen(false)}
        member={member}
      />
    </>
  );
};

export default FamilyMemberCard;
