import { useState } from 'react';
import { Edit2, Trash2, CreditCard, Wallet, Banknote, PiggyBank } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeletePaymentAccount, useAccountBalance } from '@/hooks/useSupabaseData';
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
import CreditCardFatura from './CreditCardFatura';

interface AccountCardProps {
  account: any;
}

const AccountCard = ({ account }: AccountCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFaturaOpen, setIsFaturaOpen] = useState(false);
  const deleteAccount = useDeletePaymentAccount();
  const { data: currentBalance } = useAccountBalance(account.id);

  const handleDelete = async () => {
    try {
      await deleteAccount.mutateAsync(account.id);
      toast.success('Conta removida com sucesso');
    } catch (error) {
      toast.error('Erro ao remover conta');
    }
  };

  const getAccountIcon = (tipo: string) => {
    switch (tipo) {
      case 'Cartão de Crédito':
        return <CreditCard className="h-6 w-6" />;
      case 'Poupança':
        return <PiggyBank className="h-6 w-6" />;
      case 'Dinheiro':
        return <Banknote className="h-6 w-6" />;
      default:
        return <Wallet className="h-6 w-6" />;
    }
  };

  const getAccountColor = (cor?: string) => {
    return cor || '#6366F1';
  };

  return (
    <>
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => account.tipo === 'Cartão de Crédito' && setIsFaturaOpen(true)}
      >
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: `${getAccountColor(account.cor)}20`,
                  color: getAccountColor(account.cor)
                }}
              >
                {getAccountIcon(account.tipo)}
              </div>
              <div>
                <h3 className="font-semibold">{account.nome}</h3>
                <Badge variant="secondary" className="text-xs">
                  {account.tipo}
                </Badge>
              </div>
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implementar edição
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Saldo Atual</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(currentBalance || 0)}
              </p>
            </div>

            {account.tipo === 'Cartão de Crédito' && account.dia_fechamento_fatura && (
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fechamento</span>
                  <span className="font-medium">Dia {account.dia_fechamento_fatura}</span>
                </div>
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
              Tem certeza que deseja remover a conta "{account.nome}"?
              As transações associadas não serão excluídas.
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

      {account.tipo === 'Cartão de Crédito' && (
        <CreditCardFatura
          isOpen={isFaturaOpen}
          onClose={() => setIsFaturaOpen(false)}
          account={account}
        />
      )}
    </>
  );
};

export default AccountCard;
