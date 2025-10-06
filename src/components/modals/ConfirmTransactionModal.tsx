import React from 'react';
import { CheckCircle2, Edit, X } from 'lucide-react';
import { NexusButton } from '@/components/ui/nexus-button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface TransactionData {
  description: string;
  amount: number;
  category_id?: number;
  category_name?: string;
  conta_pagadora_id?: number;
  conta_pagadora_name?: string;
  transaction_date: string;
}

interface ConfirmTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionData | null;
  onConfirm: () => void;
  onEdit: () => void;
}

const ConfirmTransactionModal: React.FC<ConfirmTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onConfirm,
  onEdit
}) => {
  if (!transaction) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CheckCircle2 className="text-primary mr-2" size={24} />
            Confirmar Transação
          </DialogTitle>
          <DialogDescription>
            Revise os detalhes antes de salvar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">Descrição:</span>
              <span className="text-sm font-medium text-foreground text-right max-w-[60%]">
                {transaction.description}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">Valor:</span>
              <span className="text-lg font-bold text-destructive">
                {formatCurrency(transaction.amount)}
              </span>
            </div>

            {transaction.category_name && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Categoria:</span>
                <span className="text-sm font-medium text-foreground">
                  {transaction.category_name}
                </span>
              </div>
            )}

            {transaction.conta_pagadora_name && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-muted-foreground">Conta:</span>
                <span className="text-sm font-medium text-foreground">
                  {transaction.conta_pagadora_name}
                </span>
              </div>
            )}

            <div className="flex justify-between items-start">
              <span className="text-sm text-muted-foreground">Data:</span>
              <span className="text-sm font-medium text-foreground">
                {formatDate(transaction.transaction_date)}
              </span>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              💡 Você pode desativar esta confirmação nas configurações do seu perfil.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <NexusButton
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            <X size={16} className="mr-2" />
            Cancelar
          </NexusButton>
          
          <NexusButton
            variant="outline"
            onClick={onEdit}
            className="flex-1"
          >
            <Edit size={16} className="mr-2" />
            Editar
          </NexusButton>
          
          <NexusButton
            onClick={onConfirm}
            className="flex-1"
          >
            <CheckCircle2 size={16} className="mr-2" />
            Confirmar
          </NexusButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmTransactionModal;
