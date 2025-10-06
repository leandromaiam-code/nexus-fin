import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, TrendingUp } from 'lucide-react';

interface CreditCardFaturaProps {
  isOpen: boolean;
  onClose: () => void;
  account: any;
}

const CreditCardFatura = ({ isOpen, onClose, account }: CreditCardFaturaProps) => {
  const diaFechamento = account.dia_fechamento_fatura || 10;
  const hoje = new Date().getDate();
  
  // Calcular dias até o fechamento
  const diasAteFechar = diaFechamento >= hoje 
    ? diaFechamento - hoje 
    : (30 - hoje) + diaFechamento;

  // Melhor dia para comprar (logo após o fechamento)
  const melhorDiaCompra = diaFechamento + 1 > 31 ? 1 : diaFechamento + 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fatura - {account.nome}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Fatura Atual</p>
                  <p className="text-3xl font-bold">
                    R$ 0,00
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nenhuma transação neste período
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Limite Disponível</p>
                  <p className="text-2xl font-bold text-green-600">
                    -
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure seu limite
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <p className="text-sm font-medium">Fecha em</p>
                </div>
                <p className="text-2xl font-bold">{diasAteFechar} dias</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dia {diaFechamento} de cada mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium">Melhor dia para compra</p>
                </div>
                <p className="text-2xl font-bold">Dia {melhorDiaCompra}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Maior prazo de pagamento
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Transações da Fatura</h3>
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma transação neste período</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditCardFatura;
