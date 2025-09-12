import React, { useState } from 'react';
import { Send, MessageSquare, DollarSign } from 'lucide-react';
import { NexusButton } from '@/components/ui/nexus-button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext'; // Importar o useAuth
import { toast } from '@/hooks/use-toast'; // Importar o toast para feedback

// Função para chamar o webhook do n8n (pode ser movida para um arquivo de API)
const sendExpenseToN8n = async (text: string, phoneNumber: string, authToken: string) => {
    const N8N_WEBHOOK_URL = 'https://n8n-n8n.ajpgd7.easypanel.host/webhook/whatsapp-inbound';

    const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}` // Envia o token de autenticação
        },
        // Monta o payload imitando a Evolution API, como especificado
        body: JSON.stringify({
            sender: `${phoneNumber}@s.whatsapp.net`,
            message: {
                conversation: text
            }
        })
    });

    if (!response.ok) {
        throw new Error('Erro ao enviar despesa para processamento.');
    }

    return response.json();
}


const Register = () => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, session } = useAuth(); // Obter o usuário e a sessão do contexto de autenticação

  const handleSubmit = async () => {
    if (!description.trim() || !user || !session) {
      toast({ title: "Erro", description: "Você precisa estar logado e preencher uma descrição.", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Chama a função que envia os dados para o webhook do n8n
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
    "Almoço no restaurante R$ 35",
    "Gasolina posto shell R$ 180",
    "Supermercado extra R$ 250",
    "Uber para casa R$ 25"
  ];

  return (
    // ... O restante do seu JSX permanece o mesmo ...
    // Apenas certifique-se de que o botão chama a nova função handleSubmit
    <div className="min-h-screen bg-background pb-20">
      <header className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-nexus rounded-full">
            <DollarSign className="text-white" size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-display mb-2">
          Registrar Despesa
        </h1>
        <p className="text-muted-foreground">
          Descreva sua despesa de forma natural
        </p>
      </header>

      <div className="px-6 space-y-6">
        {/* Main Input */}
        <div className="card-nexus">
          <div className="flex items-center space-x-2 mb-3">
            <MessageSquare className="text-primary" size={20} />
            <h3 className="font-semibold text-foreground">
              Descreva sua despesa
            </h3>
          </div>
          
          <Textarea
            placeholder="Ex: Almoço no restaurante R$ 35,00"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px] text-lg bg-background border-border resize-none"
          />
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-muted-foreground">
              {description.length}/200
            </span>
            <NexusButton
              onClick={handleSubmit}
              disabled={!description.trim() || isLoading}
              className="px-8"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Enviando...
                </div>
              ) : (
                <div className="flex items-center">
                  <Send size={16} className="mr-2" />
                  Registrar
                </div>
              )}
            </NexusButton>
          </div>
        </div>

        {/* Examples */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">
            Exemplos de descrição:
          </h3>
          <div className="space-y-2">
            {exampleTexts.map((example, index) => (
              <button
                key={index}
                onClick={() => setDescription(example)}
                className="w-full text-left p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h4 className="font-semibold text-primary mb-2">
            💡 Como funciona?
          </h4>
          <p className="text-sm text-muted-foreground">
            Nossa IA processa sua descrição em linguagem natural e categoriza automaticamente. 
            Seja específico com valores e locais para melhor precisão.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
