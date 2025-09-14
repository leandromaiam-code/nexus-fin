import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Home } from 'lucide-react';
import { sendOnboardingToN8n } from '@/lib/n8nClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Diagnostic = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    income_input_worst: '',
    income_input_best: '',
    income_input_typical: '',
    cost_of_living_reported: ''
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const formatMoney = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseInt(numbers) / 100 || 0);
    return formatted;
  };

  const handleInputChange = (field: string, value: string) => {
    const numbers = value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      [field]: numbers
    }));
  };

  const getCurrentStepData = () => {
    switch (currentStep) {
      case 1:
        return { field: 'income_input_worst', value: formData.income_input_worst };
      case 2:
        return { field: 'income_input_best', value: formData.income_input_best };
      case 3:
        return { field: 'income_input_typical', value: formData.income_input_typical };
      case 4:
        return { field: 'cost_of_living_reported', value: formData.cost_of_living_reported };
      default:
        return { field: '', value: '' };
    }
  };

  const canProceed = () => {
    if (currentStep === 5) return true; // Confirmation step
    const { value } = getCurrentStepData();
    return value && parseInt(value) > 0;
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit diagnostic
      await submitDiagnostic();
    }
  };

  const submitDiagnostic = async () => {
    try {
      setIsLoading(true);
      
      const diagnosticData = {
        income_input_worst: parseInt(formData.income_input_worst) / 100,
        income_input_best: parseInt(formData.income_input_best) / 100,
        income_input_typical: parseInt(formData.income_input_typical) / 100,
        cost_of_living_reported: parseInt(formData.cost_of_living_reported) / 100
      };

      const personalData = {
        full_name: user?.full_name,
        phone_number: user?.phone_number || ''
      };

      await sendOnboardingToN8n(personalData, diagnosticData);
      
      toast({
        title: "Diagnóstico Concluído!",
        description: "Seu perfil financeiro foi atualizado com sucesso."
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error submitting diagnostic:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar seu diagnóstico. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Renda Mínima
              </h2>
              <p className="text-muted-foreground">
                Qual é sua renda no pior cenário? (desemprego, crise, etc.)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Valor em Reais (R$)
              </label>
              <Input
                placeholder="R$ 0,00"
                value={formatMoney(formData.income_input_worst)}
                onChange={(e) => handleInputChange('income_input_worst', e.target.value)}
                className="text-lg text-center"
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Inclua auxílios, benefícios, renda de emergência
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Renda Máxima
              </h2>
              <p className="text-muted-foreground">
                Qual é sua renda no melhor cenário? (bônus, comissões, extras)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Valor em Reais (R$)
              </label>
              <Input
                placeholder="R$ 0,00"
                value={formatMoney(formData.income_input_best)}
                onChange={(e) => handleInputChange('income_input_best', e.target.value)}
                className="text-lg text-center"
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Inclua todos os ganhos extras possíveis
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Renda Típica
              </h2>
              <p className="text-muted-foreground">
                Qual é sua renda média mensal? (cenário normal)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Valor em Reais (R$)
              </label>
              <Input
                placeholder="R$ 0,00"
                value={formatMoney(formData.income_input_typical)}
                onChange={(e) => handleInputChange('income_input_typical', e.target.value)}
                className="text-lg text-center"
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Sua renda mensal mais comum
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-secondary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Custo de Vida
              </h2>
              <p className="text-muted-foreground">
                Quanto você gasta por mês para manter seu padrão de vida?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Valor em Reais (R$)
              </label>
              <Input
                placeholder="R$ 0,00"
                value={formatMoney(formData.cost_of_living_reported)}
                onChange={(e) => handleInputChange('cost_of_living_reported', e.target.value)}
                className="text-lg text-center"
              />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Inclua moradia, alimentação, transporte, etc.
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Confirmação
              </h2>
              <p className="text-muted-foreground">
                Revise suas informações antes de finalizar
              </p>
            </div>

            <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Renda Mínima:</span>
                <span className="text-sm font-medium">{formatMoney(formData.income_input_worst)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Renda Máxima:</span>
                <span className="text-sm font-medium">{formatMoney(formData.income_input_best)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Renda Típica:</span>
                <span className="text-sm font-medium">{formatMoney(formData.income_input_typical)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Custo de Vida:</span>
                <span className="text-sm font-medium">{formatMoney(formData.cost_of_living_reported)}</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 p-2 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded-full"></div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Diagnóstico Financeiro Nexus
          </h1>
          <p className="text-muted-foreground">
            Vamos descobrir seu perfil e calcular sua Renda Base
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Passo {currentStep} de {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content Card */}
        <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="ghost"
            onClick={handlePrev}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Button onClick={handleNext}>
            {currentStep === totalSteps ? 'Finalizar' : 'Próximo'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Diagnostic;