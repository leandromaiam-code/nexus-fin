import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { NexusButton } from '@/components/ui/nexus-button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { sendOnboardingToN8n } from '@/lib/n8nClient';
import { User, Brain, TrendingUp, Target, SkipForward } from 'lucide-react';

interface DiagnosticQuestion {
  id: number;
  question_text: string;
  target_column: string;
  step_order: number;
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [calculatedIncome, setCalculatedIncome] = useState(0);
  const [archetype, setArchetype] = useState('');
  const [canSkipDiagnostic, setCanSkipDiagnostic] = useState(false);
  const [existingUserData, setExistingUserData] = useState<any>(null);

  // Personal data step
  const [personalData, setPersonalData] = useState({
    full_name: '',
    phone_number: '',
    email: ''
  });

  useEffect(() => {
    checkExistingData();
  }, [user, session]);

  useEffect(() => {
    if (!isLoading) {
      loadQuestions();
    }
  }, [isLoading]);

  // Check if user already has diagnostic data
  const checkExistingData = async () => {
    try {
      if (user) {
        // If user is logged in, check their existing data
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const hasCompleteData = userData && 
          userData.income_input_typical && 
          userData.income_input_best && 
          userData.income_input_worst && 
          userData.cost_of_living_reported && 
          userData.financial_archetype;

        if (hasCompleteData) {
          // User already has complete diagnostic, redirect to dashboard
          navigate('/dashboard');
          return;
        }

        // Fill existing data
        setExistingUserData(userData);
        setPersonalData({
          full_name: userData.full_name || '',
          phone_number: userData.phone_number || '',
          email: '' // We don't store email in users table
        });

        // Set existing answers
        setAnswers({
          income_input_typical: userData.income_input_typical || '',
          income_input_best: userData.income_input_best || '',
          income_input_worst: userData.income_input_worst || '',
          cost_of_living_reported: userData.cost_of_living_reported || ''
        });

        setCanSkipDiagnostic(!!(userData.income_input_typical && userData.financial_archetype));
      }
    } catch (error) {
      console.error('Error checking existing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('diagnostic_questions')
        .select('*')
        .eq('is_active', true)
        .order('step_order');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as perguntas do diagnóstico.",
        variant: "destructive"
      });
    }
  };

  const calculateFinancialProfile = () => {
    // Base income calculation logic
    const incomeTypical = parseFloat(answers.income_input_typical || 0);
    const incomeBest = parseFloat(answers.income_input_best || 0);
    const incomeWorst = parseFloat(answers.income_input_worst || 0);
    const costOfLiving = parseFloat(answers.cost_of_living_reported || 0);

    const baseIncome = (incomeTypical * 0.6) + (incomeBest * 0.2) + (incomeWorst * 0.2);
    setCalculatedIncome(baseIncome);

    // Archetype determination
    const incomeVariability = (incomeBest - incomeWorst) / incomeTypical;
    const savingsRate = (baseIncome - costOfLiving) / baseIncome;

    let determinedArchetype = '';
    if (savingsRate > 0.3 && incomeVariability < 0.3) {
      determinedArchetype = 'Planejadora Estratégica';
    } else if (savingsRate > 0.2) {
      determinedArchetype = 'Investidora Cautelosa';
    } else if (incomeVariability > 0.5) {
      determinedArchetype = 'Empreendedora Dinâmica';
    } else {
      determinedArchetype = 'Organizadora Prática';
    }

    return determinedArchetype;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate profile first
      const determinedArchetype = calculateFinancialProfile();
      setArchetype(determinedArchetype);

      let authUserId = session?.user?.id;

      // If no session exists, create new account
      if (!session) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: personalData.email,
          password: Math.random().toString(36).slice(-8) + 'A1!', // Temporary password
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: personalData.full_name,
              phone_number: personalData.phone_number
            }
          }
        });

        if (authError) throw authError;
        authUserId = authData.user?.id;
      }

      const userDataToSave = {
        full_name: personalData.full_name,
        phone_number: personalData.phone_number,
        financial_archetype: determinedArchetype,
        renda_base_amount: calculatedIncome,
        ...answers
      };

      if (user && user.id) {
        // Update existing user
        const { error: userError } = await supabase
          .from('users')
          .update(userDataToSave)
          .eq('id', user.id);

        if (userError) throw userError;
      } else {
        // Insert new user data
        const { error: userError } = await supabase
          .from('users')
          .insert({
            auth_id: authUserId,
            ...userDataToSave
          });

        if (userError) throw userError;
      }

      // Send data to N8N webhook
      try {
        await sendOnboardingToN8n(
          personalData, 
          answers, 
          session?.access_token
        );
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the whole process if webhook fails
      }

      setShowResult(true);

      // Auto-redirect after showing result
      setTimeout(() => {
        navigate('/dashboard');
      }, 5000);

    } catch (error) {
      console.error('Error submitting:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar seu diagnóstico. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const skipDiagnostic = () => {
    navigate('/dashboard');
  };

  const nextStep = () => {
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / (questions.length + 2)) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary rounded-full animate-pulse-nexus mx-auto"></div>
          <p className="text-muted-foreground">Carregando diagnóstico...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-lg w-full p-8 text-center space-y-6 animate-scale-in">
          <div className="w-20 h-20 bg-gradient-nexus rounded-full flex items-center justify-center mx-auto">
            <Brain className="text-white" size={32} />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-display">
              Diagnóstico Concluído!
            </h1>
            
            <div className="space-y-3">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Seu Arquétipo</p>
                <p className="text-lg font-semibold text-primary">{archetype}</p>
              </div>
              
              <div className="p-4 bg-success/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Renda Base Calculada</p>
                <p className="text-2xl font-bold text-financial text-success">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(calculatedIncome)}
                </p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Redirecionando para o painel em alguns segundos...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-nexus rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-display mb-2">
            Diagnóstico Financeiro Nexus
          </h1>
          <p className="text-muted-foreground">
            Vamos descobrir seu perfil e calcular sua Renda Base
          </p>
          
          {canSkipDiagnostic && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Você já possui dados diagnósticos. Deseja pular esta etapa?
              </p>
              <NexusButton
                variant="outline"
                size="sm"
                onClick={skipDiagnostic}
                className="gap-2"
              >
                <SkipForward size={16} />
                Pular Diagnóstico
              </NexusButton>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Passo {currentStep + 1} de {questions.length + 2}
          </p>
        </div>

        {/* Content */}
        <Card className="p-6 animate-slide-up">
          {currentStep === 0 ? (
            // Personal Data Step
            <div className="space-y-6">
              <div className="text-center mb-6">
                <User className="w-12 h-12 text-primary mx-auto mb-3" />
                <h2 className="text-xl font-semibold text-display">
                  Seus Dados Pessoais
                </h2>
                <p className="text-muted-foreground">
                  Precisamos de algumas informações básicas
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={personalData.full_name}
                    onChange={(e) => setPersonalData({
                      ...personalData,
                      full_name: e.target.value
                    })}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">WhatsApp</Label>
                  <Input
                    id="phone"
                    value={personalData.phone_number}
                    onChange={(e) => setPersonalData({
                      ...personalData,
                      phone_number: e.target.value
                    })}
                    placeholder="+55 (11) 99999-9999"
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalData.email}
                    onChange={(e) => setPersonalData({
                      ...personalData,
                      email: e.target.value
                    })}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
            </div>
          ) : (
            // Question Steps
            questions[currentStep - 1] && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <TrendingUp className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h2 className="text-xl font-semibold text-display">
                    Pergunta {currentStep}
                  </h2>
                </div>

                <div className="space-y-4">
                  <p className="text-foreground text-center">
                    {questions[currentStep - 1].question_text}
                  </p>

                  {questions[currentStep - 1].target_column.includes('income') || questions[currentStep - 1].target_column.includes('cost_of_living') ? (
                    <Input
                      type="number"
                      value={answers[questions[currentStep - 1].target_column] || ''}
                      onChange={(e) => setAnswers({
                        ...answers,
                        [questions[currentStep - 1].target_column]: e.target.value
                      })}
                      placeholder="Digite o valor em R$"
                      className="text-center text-lg"
                    />
                  ) : (
                    <RadioGroup
                      value={answers[questions[currentStep - 1].target_column] || ''}
                      onValueChange={(value) => setAnswers({
                        ...answers,
                        [questions[currentStep - 1].target_column]: value
                      })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="low" id="low" />
                        <Label htmlFor="low">Baixo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medium" id="medium" />
                        <Label htmlFor="medium">Médio</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="high" id="high" />
                        <Label htmlFor="high">Alto</Label>
                      </div>
                    </RadioGroup>
                  )}
                </div>
              </div>
            )
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <NexusButton
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Voltar
            </NexusButton>

            <NexusButton
              onClick={nextStep}
              disabled={
                (currentStep === 0 && (!personalData.full_name || !personalData.phone_number || !personalData.email)) ||
                (currentStep > 0 && !answers[questions[currentStep - 1]?.target_column])
              }
              loading={isSubmitting}
            >
              {currentStep === questions.length ? 'Finalizar' : 'Próximo'}
            </NexusButton>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;