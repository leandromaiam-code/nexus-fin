import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, Plus, Calendar, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { NexusButton } from '@/components/ui/nexus-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGoalTemplates, useCreateGoal } from '@/hooks/useSupabaseData';
import { CardSkeleton } from '@/components/ui/skeleton-loader';
import { toast } from '@/hooks/use-toast';

const GoalCatalog = () => {
  const navigate = useNavigate();
  const { data: templates, isLoading } = useGoalTemplates();
  const createGoalMutation = useCreateGoal();
  
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  const [goalForm, setGoalForm] = useState({
    custom_name: '',
    target_amount: '',
    target_date: '',
    is_primary: false,
    current_amount: ''
  });

  const [customGoalForm, setCustomGoalForm] = useState({
    name: '',
    description: '',
    target_amount: '',
    target_date: '',
    is_primary: false,
    current_amount: ''
  });

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setGoalForm({
      custom_name: template.name,
      target_amount: '',
      target_date: '',
      is_primary: false,
      current_amount: '0'
    });
    setShowGoalModal(true);
  };

  const handleCreateCustomGoal = () => {
    setShowCustomModal(true);
  };

  const handleGoalSubmit = async () => {
    try {
      const goalData = selectedTemplate ? {
        goal_template_id: selectedTemplate.id,
        target_amount: parseFloat(goalForm.target_amount),
        target_date: goalForm.target_date || undefined,
        is_primary: goalForm.is_primary,
        current_amount: parseFloat(goalForm.current_amount) || 0
      } : {
        custom_name: customGoalForm.name,
        target_amount: parseFloat(customGoalForm.target_amount),
        target_date: customGoalForm.target_date || undefined,
        is_primary: customGoalForm.is_primary,
        current_amount: parseFloat(customGoalForm.current_amount) || 0
      };

      await createGoalMutation.mutateAsync(goalData);
      
      setShowGoalModal(false);
      setShowCustomModal(false);
      navigate('/plan');
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const TemplateCard = ({ template }: { template: any }) => (
    <Card 
      className="p-6 cursor-pointer transition-all hover:scale-105 hover:shadow-lg animate-fade-in"
      onClick={() => handleTemplateSelect(template)}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Target className="text-primary" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{template.name}</h3>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-primary font-medium">
          Começar Meta
        </span>
        <Plus className="text-primary" size={16} />
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse"></div>
        </header>
        <div className="px-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 animate-fade-in">
      {/* Header */}
      <header className="p-6 flex items-center space-x-3">
        <NexusButton
          variant="ghost"
          size="icon"
          onClick={() => navigate('/plan')}
        >
          <ArrowLeft size={20} />
        </NexusButton>
        <div>
          <h1 className="text-2xl font-bold text-display">Catálogo de Metas</h1>
          <p className="text-muted-foreground">Escolha uma meta ou crie a sua própria</p>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Custom Goal Card */}
        <Card 
          className="p-6 border-dashed border-2 border-primary/30 bg-primary/5 cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/10"
          onClick={handleCreateCustomGoal}
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Plus className="text-primary" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary">Meta Personalizada</h3>
              <p className="text-sm text-primary/80">Crie uma meta única para seus objetivos</p>
            </div>
          </div>
        </Card>

        {/* Template Goals */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Modelos de Metas
          </h2>
          
          {templates && templates.length > 0 ? (
            <div className="space-y-4">
              {templates.map((template, index) => (
                <div key={template.id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <TemplateCard template={template} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum modelo disponível no momento.</p>
            </div>
          )}
        </div>
      </div>

      {/* Goal Configuration Modal */}
      <Dialog open={showGoalModal} onOpenChange={setShowGoalModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Target className="text-primary" size={20} />
              <span>Configurar Meta</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Nome da Meta</Label>
              <Input
                value={goalForm.custom_name}
                onChange={(e) => setGoalForm({ ...goalForm, custom_name: e.target.value })}
                placeholder="Nome da sua meta"
              />
            </div>

            <div>
              <Label htmlFor="target_amount">Valor Objetivo</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-muted-foreground" size={16} />
                <Input
                  id="target_amount"
                  type="number"
                  value={goalForm.target_amount}
                  onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
                  placeholder="0,00"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="current_amount">Valor Atual (Opcional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-muted-foreground" size={16} />
                <Input
                  id="current_amount"
                  type="number"
                  value={goalForm.current_amount}
                  onChange={(e) => setGoalForm({ ...goalForm, current_amount: e.target.value })}
                  placeholder="0,00"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Informe quanto você já possui para esta meta
              </p>
            </div>

            <div>
              <Label htmlFor="target_date">Data Objetivo (Opcional)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-muted-foreground" size={16} />
                <Input
                  id="target_date"
                  type="date"
                  value={goalForm.target_date}
                  onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_primary"
                checked={goalForm.is_primary}
                onCheckedChange={(checked) => setGoalForm({ ...goalForm, is_primary: checked })}
              />
              <Label htmlFor="is_primary">Definir como meta principal</Label>
            </div>

            <div className="flex space-x-2 pt-4">
              <NexusButton
                variant="ghost"
                onClick={() => setShowGoalModal(false)}
                className="flex-1"
              >
                Cancelar
              </NexusButton>
              <NexusButton
                onClick={handleGoalSubmit}
                loading={createGoalMutation.isPending}
                disabled={!goalForm.custom_name || !goalForm.target_amount}
                className="flex-1"
              >
                Criar Meta
              </NexusButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Goal Modal */}
      <Dialog open={showCustomModal} onOpenChange={setShowCustomModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="text-primary" size={20} />
              <span>Meta Personalizada</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Nome da Meta</Label>
              <Input
                value={customGoalForm.name}
                onChange={(e) => setCustomGoalForm({ ...customGoalForm, name: e.target.value })}
                placeholder="Ex: Viagem dos sonhos"
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={customGoalForm.description}
                onChange={(e) => setCustomGoalForm({ ...customGoalForm, description: e.target.value })}
                placeholder="Descreva sua meta..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="custom_target_amount">Valor Objetivo</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-muted-foreground" size={16} />
                <Input
                  id="custom_target_amount"
                  type="number"
                  value={customGoalForm.target_amount}
                  onChange={(e) => setCustomGoalForm({ ...customGoalForm, target_amount: e.target.value })}
                  placeholder="0,00"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="custom_current_amount">Valor Atual (Opcional)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-muted-foreground" size={16} />
                <Input
                  id="custom_current_amount"
                  type="number"
                  value={customGoalForm.current_amount}
                  onChange={(e) => setCustomGoalForm({ ...customGoalForm, current_amount: e.target.value })}
                  placeholder="0,00"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Informe quanto você já possui para esta meta
              </p>
            </div>

            <div>
              <Label htmlFor="custom_target_date">Data Objetivo (Opcional)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-muted-foreground" size={16} />
                <Input
                  id="custom_target_date"
                  type="date"
                  value={customGoalForm.target_date}
                  onChange={(e) => setCustomGoalForm({ ...customGoalForm, target_date: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="custom_is_primary"
                checked={customGoalForm.is_primary}
                onCheckedChange={(checked) => setCustomGoalForm({ ...customGoalForm, is_primary: checked })}
              />
              <Label htmlFor="custom_is_primary">Definir como meta principal</Label>
            </div>

            <div className="flex space-x-2 pt-4">
              <NexusButton
                variant="ghost"
                onClick={() => setShowCustomModal(false)}
                className="flex-1"
              >
                Cancelar
              </NexusButton>
              <NexusButton
                onClick={handleGoalSubmit}
                loading={createGoalMutation.isPending}
                disabled={!customGoalForm.name || !customGoalForm.target_amount}
                className="flex-1"
              >
                Criar Meta
              </NexusButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalCatalog;