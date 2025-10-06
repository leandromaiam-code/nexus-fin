import { useState } from 'react';
import { Plus, ArrowLeft, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePaymentAccounts } from '@/hooks/useSupabaseData';
import AccountCard from '@/components/accounts/AccountCard';
import AddAccountModal from '@/components/accounts/AddAccountModal';

const PaymentAccounts = () => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const { data: accounts = [], isLoading } = usePaymentAccounts();

  const totalBalance = accounts.reduce((sum, acc) => {
    return sum + (Number(acc.saldo_inicial) || 0);
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando contas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Contas Pagadoras</h1>
                <p className="text-sm text-muted-foreground">
                  {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
                </p>
              </div>
            </div>

            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saldo Total</p>
                <p className="text-3xl font-bold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(totalBalance)}
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {accounts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma conta cadastrada</h3>
              <p className="text-muted-foreground mb-6">
                Adicione suas contas bancárias e cartões de crédito para começar
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeira Conta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Suas Contas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          </div>
        )}
      </div>

      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default PaymentAccounts;
