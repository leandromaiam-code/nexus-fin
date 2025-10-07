import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, ExternalLink } from 'lucide-react';

interface PaymentMethodCardProps {
  onManagePayment: () => void;
  isLoading: boolean;
}

export const PaymentMethodCard = ({ onManagePayment, isLoading }: PaymentMethodCardProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Método de Pagamento</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="h-12 w-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
          <CreditCard className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <p className="font-medium">Gerenciado pelo Stripe</p>
          <p className="text-sm text-muted-foreground">
            Seus dados de pagamento são processados de forma segura
          </p>
        </div>
      </div>

      <Button 
        onClick={onManagePayment} 
        disabled={isLoading}
        variant="outline"
        className="w-full"
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        Gerenciar Método de Pagamento
      </Button>
    </Card>
  );
};
