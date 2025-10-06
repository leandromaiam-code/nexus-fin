import React, { useState } from 'react';
import { Users, UserPlus, SkipForward } from 'lucide-react';
import { NexusButton } from '@/components/ui/nexus-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface FamilySetupProps {
  familyData: any;
  onDataChange: (data: any) => void;
}

const FamilySetup: React.FC<FamilySetupProps> = ({ familyData, onDataChange }) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'choose' | 'create' | 'skip'>('choose');
  const [familyName, setFamilyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFamily = async () => {
    if (!familyName.trim() || !user?.id) {
      toast({
        title: "Erro",
        description: "Digite um nome para a família",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      console.log('Criando família para user_id:', user.id);
      
      // Criar família
      const { data: familia, error: familiaError } = await supabase
        .from('familias' as any)
        .insert({ nome_familia: familyName.trim() } as any)
        .select()
        .single();

      if (familiaError) {
        console.error('Erro ao criar família:', familiaError);
        throw familiaError;
      }

      console.log('Família criada:', familia);

      // Adicionar usuário como responsável
      const { error: membroError } = await supabase
        .from('membros_familia' as any)
        .insert({
          familia_id: (familia as any).id,
          user_id: user.id,
          papel: 'Responsável',
          cota_mensal: 0
        } as any);

      if (membroError) {
        console.error('Erro ao adicionar membro:', membroError);
        throw membroError;
      }

      console.log('Membro adicionado com sucesso');

      onDataChange(familia);
      
      toast({
        title: "Família criada!",
        description: `${familyName} foi criada com sucesso.`
      });
    } catch (error: any) {
      console.error('Erro detalhado ao criar família:', error);
      const message = error.message || 'Erro desconhecido';
      toast({
        title: "Erro ao criar família",
        description: `${message}. Verifique o console para mais detalhes.`,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSkipFamily = () => {
    setMode('skip');
    onDataChange(null); // Indica que optou por não criar família
    toast({
      title: "Ok!",
      description: "Você pode criar uma família mais tarde nas configurações."
    });
  };

  if (mode === 'choose') {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-display mb-2">
            Configuração Familiar
          </h2>
          <p className="text-muted-foreground">
            Deseja gerenciar as finanças em família ou individualmente?
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('create')}
            className="p-6 border-2 border-border rounded-xl hover:border-primary transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                <Users className="text-primary" size={32} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Criar Família</h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie orçamentos e metas compartilhadas
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={handleSkipFamily}
            className="p-6 border-2 border-border rounded-xl hover:border-primary transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-muted rounded-full group-hover:bg-muted/70 transition-colors">
                <UserPlus className="text-muted-foreground" size={32} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Uso Individual</h3>
                <p className="text-sm text-muted-foreground">
                  Gerenciar apenas minhas finanças pessoais
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h4 className="font-semibold text-primary mb-2">
            💡 Sobre Famílias
          </h4>
          <p className="text-sm text-muted-foreground">
            Ao criar uma família, você pode:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            <li>• Adicionar membros e definir cotas individuais</li>
            <li>• Compartilhar orçamentos e visualizar gastos conjuntos</li>
            <li>• Criar metas financeiras familiares</li>
            <li>• Configurar um sistema de gamificação com recompensas</li>
          </ul>
        </div>
      </div>
    );
  }

  if (mode === 'skip') {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-muted rounded-full">
              <SkipForward className="text-muted-foreground" size={48} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-display mb-2">
            Modo Individual
          </h2>
          <p className="text-muted-foreground">
            Você escolheu gerenciar suas finanças individualmente
          </p>
        </div>

        <div className="card-nexus text-center">
          <p className="text-sm text-muted-foreground">
            Você pode criar ou entrar em uma família a qualquer momento através das configurações.
          </p>
        </div>
      </div>
    );
  }

  // mode === 'create'
  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-display mb-2">
          Criar Nova Família
        </h2>
        <p className="text-muted-foreground">
          Escolha um nome para sua família
        </p>
      </div>

      <div className="card-nexus">
        <Label htmlFor="family-name" className="text-sm font-medium text-foreground mb-2 block">
          Nome da Família
        </Label>
        <Input
          id="family-name"
          type="text"
          placeholder="Ex: Família Silva, Nossa Casa, etc."
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          className="mb-4"
          maxLength={50}
        />
        
        <NexusButton
          onClick={handleCreateFamily}
          disabled={!familyName.trim() || isCreating}
          className="w-full"
        >
          {isCreating ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Criando...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Users size={18} className="mr-2" />
              Criar Família
            </div>
          )}
        </NexusButton>
      </div>

      <div className="text-center">
        <button
          onClick={() => setMode('choose')}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          ← Voltar às opções
        </button>
      </div>
    </div>
  );
};

export default FamilySetup;
