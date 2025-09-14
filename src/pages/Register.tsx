import React, { useState } from 'react';
import { Send, MessageSquare, DollarSign } from 'lucide-react';
import { NexusButton } from '@/components/ui/nexus-button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { sendExpenseToN8n } from '@/lib/n8nClient';

const Register = () => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, session } = useAuth(); // Pega o usuário e a sessão do contexto

  const handleSubmit = async () => {
    if (!description.trim() || !user || !session) {
      toast({ title: "Erro", description: "Você precisa estar logado e preencher uma descrição.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Chama o nosso novo serviço, passando o texto, o número de telefone e o token
      await sendExpenseToN8n(description, user.phone_number, session.access_token);
      
      toast({
        title: "Despesa Enviada!",
        description: "O Nexus já está a processar o seu registo."
      });
      setDescription('');

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

  const exampleTexts = [
    "Almoço no restaurante R$ 35 hoje",
    "Gasolina posto shell R$ 180 hoje",
    "Supermercado extra R$ 250 ontem ",
    "Uber para casa R$ 25 dia 13 desse mês"
  ];

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-20 md:pb-0">
      <header className="p-4 sm:p-6 text-center">
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="p-3 sm:p-4 bg-gradient-nexus rounded-full">
            <DollarSign className="text-white" size={24} />
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-display mb-2">
          Registrar Despesa
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
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
                  <span className="sm:hidden">Enviando...</span>
                  <span className="hidden sm:inline">Enviando...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Send size={14} className="mr-1.5 sm:mr-2" />
                  Registrar
                </div>
              )}
            </NexusButton>
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
    </div>
  );
};

export default Register;
