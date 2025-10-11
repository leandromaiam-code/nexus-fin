import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { sendExpenseToN8n } from '@/lib/n8nClient';
import { Textarea } from '@/components/ui/textarea';
import { NexusButton } from '@/components/ui/nexus-button';
import { toast } from '@/hooks/use-toast';
import { MessageSquare, DollarSign } from 'lucide-react';
import ConfirmTransactionModal from '@/components/modals/ConfirmTransactionModal';
import { useTransactionConfirmation, TransactionData } from '@/hooks/useTransactionConfirmation';
import { supabase } from '@/integrations/supabase/client';
import BackButton from '@/components/ui/back-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Register = () => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<TransactionData | null>(null);
  const { user, session } = useAuth();
  const { needsConfirmation } = useTransactionConfirmation();
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchAccountsAndMembers = async () => {
      if (!user?.id) return;
      
      // Buscar contas pagadoras
      const { data: accountsData } = await supabase
        .from('contas_pagadoras')
        .select('id, nome, tipo')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (accountsData) setAccounts(accountsData);
      
      // Buscar familia_id do usuário atual
      const { data: userFamilyData } = await supabase
        .from('membros_familia')
        .select('familia_id')
        .eq('user_id', user.id)
        .single();
      
      if (userFamilyData?.familia_id) {
        // Buscar membros da família
        const { data: membersData } = await supabase
          .from('membros_familia')
          .select(`
            id,
            user_id,
            papel,
            users!inner(id, full_name)
          `)
          .eq('familia_id', userFamilyData.familia_id);
        
        if (membersData) {
          const formattedMembers = membersData.map((m: any) => ({
            id: m.id,
            user_id: m.user_id,
            nome: m.users.full_name,
            papel: m.papel
          }));
          setFamilyMembers(formattedMembers);
        }
      }
    };
    
    fetchAccountsAndMembers();
  }, [user?.id]);

  const handleSubmit = async () => {
    if (!description.trim() || !user || !session) {
      toast({ title: "Erro", description: "Você precisa estar logado e preencher uma descrição.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Preparar dados adicionais
      const selectedAccount = accounts.find(a => a.id === selectedAccountId);
      const selectedMember = familyMembers.find(m => m.id === selectedMemberId);
      
      const additionalData = {
        conta_pagadora_id: selectedAccountId,
        conta_pagadora_nome: selectedAccount?.nome || null,
        membro_familia_id: selectedMemberId,
        membro_familia_nome: selectedMember?.nome || null,
        user_id: user.id,
        user_nome: user.full_name
      };
      
      const response = await sendExpenseToN8n(
        description, 
        user.phone_number, 
        session.access_token,
        additionalData
      );
      
      // Se retornou dados estruturados e precisa confirmação
      if (needsConfirmation && response?.parsedData) {
        setPendingTransaction(response.parsedData);
        setShowConfirmModal(true);
        toast({ title: "Revise os dados antes de confirmar." });
      } else {
        toast({ title: "Despesa Enviada!", description: "O Nexus já está a processar o seu registo." });
        setDescription('');
        setSelectedAccountId(null);
        setSelectedMemberId(null);
      }

    } catch (error: any) {
      console.error('Erro ao enviar despesa:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível enviar a sua despesa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTransaction = async () => {
    if (!pendingTransaction || !user?.id) return;

    try {
      const { error } = await supabase.from('transactions').insert([{
        user_id: user.id,
        description: pendingTransaction.description,
        amount: pendingTransaction.amount,
        category_id: pendingTransaction.category_id,
        conta_pagadora_id: pendingTransaction.conta_pagadora_id,
        transaction_date: pendingTransaction.transaction_date,
        tipo: pendingTransaction.tipo || 'Saída'
      }]);

      if (error) throw error;

      toast({ title: 'Transação confirmada e salva!' });
      setShowConfirmModal(false);
      setPendingTransaction(null);
      setDescription('');
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      toast({ title: 'Erro ao salvar transação.', variant: 'destructive' });
    }
  };

  const handleEditTransaction = () => {
    if (pendingTransaction) {
      setDescription(pendingTransaction.description);
    }
    setShowConfirmModal(false);
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setPendingTransaction(null);
  };

  const exampleTexts = [
    "Almoço no restaurante R$ 35 hoje",
    "Gasolina posto shell R$ 180 hoje",
    "Supermercado extra R$ 250 ontem ",
    "Uber para casa R$ 25 dia 13 desse mês"
  ];

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-20 md:pb-0">
      <header className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <BackButton />
          <div className="flex-1 flex justify-center">
            <div className="p-3 sm:p-4 bg-gradient-nexus rounded-full">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
          <div className="w-10"></div>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-display mb-2 text-center">
          Registrar Despesa
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground text-center">
          Descreva sua despesa de forma natural
        </p>
      </header>

      <div className="px-4 sm:px-6 space-y-4 sm:space-y-6">
        {/* Main Input */}
        <div className="card-nexus">
          <div className="flex items-center space-x-2 mb-3">
            <MessageSquare className="text-primary" size={18} />
            <h3 className="font-semibold text-foreground text-sm sm:text-base">
              Descreva sua despesa
            </h3>
          </div>
          
          <Textarea
            placeholder="Ex: Almoço no restaurante R$ 35,00"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] sm:min-h-[120px] text-base sm:text-lg bg-background border-border resize-none"
          />
          
          <div className="flex justify-between items-center mt-3 sm:mt-4">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {description.length}/200
            </span>
            <NexusButton
              onClick={handleSubmit}
              disabled={!description.trim() || isLoading}
              className="px-4 sm:px-8 text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-3 sm:h-4 w-3 sm:w-4 border-2 border-white border-t-transparent mr-1.5 sm:mr-2" />
                  <span>Enviando...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  Registrar
                </div>
              )}
            </NexusButton>
          </div>
        </div>

        {/* Campos Opcionais */}
        <div className="card-nexus space-y-4">
          <h3 className="font-semibold text-foreground text-sm sm:text-base">
            Informações Adicionais (Opcional)
          </h3>
          
          {/* Conta Pagadora */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm text-muted-foreground">
              Conta Pagadora
            </label>
            <Select 
              value={selectedAccountId?.toString() || "none"} 
              onValueChange={(val) => setSelectedAccountId(val === "none" ? null : Number(val))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma selecionada</SelectItem>
                {accounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id.toString()}>
                    {acc.nome} ({acc.tipo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Membro da Família */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm text-muted-foreground">
              Membro da Família
            </label>
            <Select 
              value={selectedMemberId?.toString() || "none"} 
              onValueChange={(val) => setSelectedMemberId(val === "none" ? null : Number(val))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um membro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Eu mesmo (padrão)</SelectItem>
                {familyMembers.map(member => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.nome} - {member.papel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Examples */}
        <div>
          <h3 className="font-semibold text-foreground mb-2 sm:mb-3 text-sm sm:text-base">
            Exemplos de descrição:
          </h3>
          <div className="space-y-1.5 sm:space-y-2">
            {exampleTexts.map((example, index) => (
              <button
                key={index}
                onClick={() => setDescription(example)}
                className="w-full text-left p-2.5 sm:p-3 bg-muted/50 rounded-lg text-xs sm:text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 sm:p-4">
          <h4 className="font-semibold text-primary mb-2 text-sm sm:text-base">
            💡 Como funciona?
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Nossa IA processa sua descrição em linguagem natural e categoriza automaticamente. 
            Seja específico com valores e locais para melhor precisão.
          </p>
        </div>
      </div>

      {pendingTransaction && (
        <ConfirmTransactionModal
          isOpen={showConfirmModal}
          onClose={handleCloseModal}
          transaction={pendingTransaction}
          onConfirm={handleConfirmTransaction}
          onEdit={handleEditTransaction}
        />
      )}
    </div>
  );
};

export default Register;
