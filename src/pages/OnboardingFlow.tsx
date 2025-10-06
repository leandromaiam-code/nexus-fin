import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { NexusButton } from '@/components/ui/nexus-button';
import { CheckCircle2, Sparkles } from 'lucide-react';
import StepIndicator from '@/components/onboarding/StepIndicator';
import FamilySetup from '@/components/onboarding/FamilySetup';
import AccountSetup from '@/components/onboarding/AccountSetup';
import BudgetSetup from '@/components/onboarding/BudgetSetup';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  // Estados para os dados de cada step
  const [familyData, setFamilyData] = useState<any>(null);
  const [accountsData, setAccountsData] = useState<any[]>([]);
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [confirmTransactions, setConfirmTransactions] = useState(true);

  const totalSteps = 5;

  useEffect(() => {
    // Restaurar progresso do localStorage
    const savedProgress = localStorage.getItem('onboarding_progress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCurrentStep(progress.step || 0);
      setFamilyData(progress.familyData);
      setAccountsData(progress.accountsData || []);
      setBudgetData(progress.budgetData || []);
      setConfirmTransactions(progress.confirmTransactions ?? true);
    }
  }, []);

  const saveProgress = (step: number) => {
    localStorage.setItem('onboarding_progress', JSON.stringify({
      step,
      familyData,
      accountsData,
      budgetData,
      confirmTransactions
    }));
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveProgress(nextStep);
    } else {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveProgress(prevStep);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  const completeOnboarding = async () => {
    if (!user?.id) return;

    setIsCompleting(true);
    try {
      // Atualizar preferência de confirmação de transações
      await supabase
        .from('users' as any)
        .update({ confirmar_registros: confirmTransactions } as any)
        .eq('id', user.id);

      // Limpar progresso salvo
      localStorage.removeItem('onboarding_progress');

      toast({
        title: "Bem-vindo ao Nexus Financeiro! 🎉",
        description: "Sua conta está configurada e pronta para uso."
      });

      navigate('/');
    } catch (error: any) {
      console.error('Erro ao completar onboarding:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a configuração. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Boas-vindas
        return true;
      case 1: // Família
        return familyData !== null; // Pode ser null se optou por não criar família
      case 2: // Contas
        return accountsData.length > 0;
      case 3: // Orçamento
        return budgetData.length > 0;
      case 4: // Confirmação
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="p-6 bg-gradient-nexus rounded-full">
                <Sparkles className="text-white" size={48} />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-display mb-3">
                Bem-vindo ao Nexus Financeiro!
              </h1>
              <p className="text-muted-foreground text-lg">
                Vamos configurar sua conta em alguns passos simples
              </p>
            </div>
            <div className="card-nexus text-left max-w-md mx-auto">
              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                <CheckCircle2 className="text-primary mr-2" size={20} />
                O que você vai configurar:
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Criar ou entrar em uma família (opcional)</li>
                <li>• Adicionar suas contas bancárias e cartões</li>
                <li>• Definir um orçamento inicial por categoria</li>
                <li>• Configurar preferências de confirmação</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Você pode pular esta configuração e fazer depois
            </p>
          </div>
        );

      case 1:
        return (
          <FamilySetup 
            familyData={familyData}
            onDataChange={setFamilyData}
          />
        );

      case 2:
        return (
          <AccountSetup 
            accountsData={accountsData}
            onDataChange={setAccountsData}
          />
        );

      case 3:
        return (
          <BudgetSetup 
            budgetData={budgetData}
            onDataChange={setBudgetData}
          />
        );

      case 4:
        return (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-display mb-2">
                Preferências de Registro
              </h2>
              <p className="text-muted-foreground">
                Configure como deseja registrar suas transações
              </p>
            </div>

            <div className="card-nexus">
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">
                    Confirmar registros antes de salvar
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Quando ativado, você poderá revisar cada transação antes de salvá-la definitivamente.
                    Isso ajuda a evitar erros e manter seus dados mais precisos.
                  </p>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setConfirmTransactions(true)}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        confirmTransactions
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium text-foreground">Sim, confirmar</div>
                      <div className="text-xs text-muted-foreground mt-1">Recomendado</div>
                    </button>
                    <button
                      onClick={() => setConfirmTransactions(false)}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                        !confirmTransactions
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium text-foreground">Não confirmar</div>
                      <div className="text-xs text-muted-foreground mt-1">Mais rápido</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <h4 className="font-semibold text-primary mb-2">
                💡 Dica
              </h4>
              <p className="text-sm text-muted-foreground">
                Você pode alterar esta preferência a qualquer momento nas configurações do seu perfil.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        
        <div className="mt-8">
          {renderStep()}
        </div>

        <div className="mt-8 flex justify-between gap-4">
          {currentStep > 0 && (
            <NexusButton
              variant="outline"
              onClick={handleBack}
              disabled={isCompleting}
              className="flex-1 sm:flex-none"
            >
              Voltar
            </NexusButton>
          )}
          
          <div className="flex gap-3 flex-1 justify-end">
            {currentStep === 0 && (
              <NexusButton
                variant="ghost"
                onClick={handleSkip}
              >
                Pular configuração
              </NexusButton>
            )}
            
            <NexusButton
              onClick={handleNext}
              disabled={!canProceed() || isCompleting}
              className="flex-1 sm:flex-none"
            >
              {isCompleting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Finalizando...
                </div>
              ) : currentStep === totalSteps - 1 ? (
                'Finalizar'
              ) : (
                'Próximo'
              )}
            </NexusButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
