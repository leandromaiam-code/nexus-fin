import React, { useState } from 'react';
import { Wallet, CreditCard, Plus, Trash2 } from 'lucide-react';
import { NexusButton } from '@/components/ui/nexus-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface AccountSetupProps {
  accountsData: any[];
  onDataChange: (data: any[]) => void;
}

const AccountSetup: React.FC<AccountSetupProps> = ({ accountsData, onDataChange }) => {
  const { user } = useAuth();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('Conta Corrente');
  const [saldoInicial, setSaldoInicial] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const tiposConta = [
    'Conta Corrente',
    'Poupança',
    'Cartão de Crédito',
    'Dinheiro'
  ];

  const handleAddAccount = async () => {
    if (!nome.trim() || !user?.id) {
      toast({
        title: "Erro",
        description: "Preencha o nome da conta",
        variant: "destructive"
      });
      return;
    }

    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from('contas_pagadoras' as any)
        .insert({
          user_id: user.id,
          nome: nome.trim(),
          tipo,
          saldo_inicial: parseFloat(saldoInicial) || 0
        } as any)
        .select()
        .single();

      if (error) throw error;

      onDataChange([...accountsData, data]);
      
      // Limpar form
      setNome('');
      setSaldoInicial('');
      
      toast({
        title: "Conta adicionada!",
        description: `${nome} foi adicionada com sucesso.`
      });
    } catch (error: any) {
      console.error('Erro ao adicionar conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a conta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveAccount = async (id: number) => {
    try {
      const { error } = await supabase
        .from('contas_pagadoras' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      onDataChange(accountsData.filter(acc => acc.id !== id));
      
      toast({
        title: "Conta removida",
        description: "A conta foi removida com sucesso."
      });
    } catch (error: any) {
      console.error('Erro ao remover conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a conta.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-display mb-2">
          Contas Pagadoras
        </h2>
        <p className="text-muted-foreground">
          Adicione suas contas bancárias e cartões
        </p>
      </div>

      {/* Form para adicionar conta */}
      <div className="card-nexus">
        <h3 className="font-semibold text-foreground mb-4 flex items-center">
          <Plus className="text-primary mr-2" size={20} />
          Adicionar Conta
        </h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="account-name" className="text-sm font-medium text-foreground mb-2 block">
              Nome da Conta *
            </Label>
            <Input
              id="account-name"
              type="text"
              placeholder="Ex: Banco do Brasil, Nubank, etc."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={50}
            />
          </div>

          <div>
            <Label htmlFor="account-type" className="text-sm font-medium text-foreground mb-2 block">
              Tipo de Conta *
            </Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger id="account-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tiposConta.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="initial-balance" className="text-sm font-medium text-foreground mb-2 block">
              Saldo Inicial (opcional)
            </Label>
            <Input
              id="initial-balance"
              type="number"
              placeholder="0,00"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(e.target.value)}
              step="0.01"
            />
          </div>

          <NexusButton
            onClick={handleAddAccount}
            disabled={!nome.trim() || isAdding}
            className="w-full"
          >
            {isAdding ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Adicionando...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Plus size={18} className="mr-2" />
                Adicionar Conta
              </div>
            )}
          </NexusButton>
        </div>
      </div>

      {/* Lista de contas adicionadas */}
      {accountsData.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">
            Contas Adicionadas ({accountsData.length})
          </h3>
          <div className="space-y-2">
            {accountsData.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {account.tipo === 'Cartão de Crédito' ? (
                      <CreditCard className="text-primary" size={18} />
                    ) : (
                      <Wallet className="text-primary" size={18} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{account.nome}</p>
                    <p className="text-xs text-muted-foreground">{account.tipo}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveAccount(account.id)}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="text-destructive" size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {accountsData.length === 0 && (
        <div className="bg-muted/30 border border-border rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma conta adicionada ainda. Adicione pelo menos uma conta para continuar.
          </p>
        </div>
      )}

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <h4 className="font-semibold text-primary mb-2">
          💡 Dica
        </h4>
        <p className="text-sm text-muted-foreground">
          Adicione todas as suas contas bancárias e cartões de crédito para ter um controle completo das suas finanças.
          Você poderá visualizar o saldo consolidado e rastrear transações por conta.
        </p>
      </div>
    </div>
  );
};

export default AccountSetup;
