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

interface CancelSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export const CancelSubscriptionDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: CancelSubscriptionDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar Assinatura</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Tem certeza que deseja cancelar sua assinatura?</p>
            <p className="font-medium">
              Você continuará com acesso até o final do período já pago.
            </p>
            <p className="text-sm">
              Após o cancelamento, você perderá acesso a todos os recursos premium.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Manter Assinatura
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Cancelando...' : 'Sim, Cancelar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
