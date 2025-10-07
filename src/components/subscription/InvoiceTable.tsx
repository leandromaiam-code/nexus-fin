import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Invoice {
  id: string;
  date: number;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
  description: string;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading: boolean;
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive'> = {
  paid: 'default',
  open: 'secondary',
  void: 'destructive',
  uncollectible: 'destructive',
};

const statusLabels: Record<string, string> = {
  paid: 'Pago',
  open: 'Aberto',
  void: 'Cancelado',
  uncollectible: 'Não coletável',
  draft: 'Rascunho',
};

export const InvoiceTable = ({ invoices, isLoading }: InvoiceTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!invoices.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma fatura encontrada
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>
                {format(new Date(invoice.date * 1000), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell>{invoice.description}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(invoice.amount, invoice.currency)}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariants[invoice.status] || 'secondary'}>
                  {statusLabels[invoice.status] || invoice.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {invoice.pdfUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(invoice.pdfUrl!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
