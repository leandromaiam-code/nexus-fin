import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, RefreshCw } from 'lucide-react';
import { useUserData } from '@/hooks/useSupabaseData';
import { NexusButton } from '@/components/ui/nexus-button';
import { executeWebAction } from '@/lib/n8nClient';
import { toast } from '@/hooks/use-toast';
import BackButton from '@/components/ui/back-button';

const MyDiagnostic = () => {
  const navigate = useNavigate();
  const { data: userData, isLoading } = useUserData();

  const archetypeData = {
    investor: {
      name: 'Investidor',
      description: 'Você tem uma visão de longo prazo e um superávit para alocar em seus investimentos.',
      icon: '🚀',
    },
    equilibrist: {
      name: 'Equilibrista',
      description: 'Você balanceia bem entre economia e gastos, adaptando-se às situações.',
      icon: '⚖️',
    },
    rescuer: {
      name: 'Piloto de Resgate',
      description: 'Sua missão é reverter o déficit e reestruturar suas finanças para retomar o controle.',
      icon: '🛡️',
    }
  };

  const handleRecalibrate = async () => {
    try {
        toast({ title: "Aguarde", description: "Iniciando recalibração via WhatsApp..." });
        await executeWebAction('RECALIBRATE_DIAGNOSIS');
        // O n8n irá agora enviar a mensagem no WhatsApp do usuário
    } catch (error: any) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };
  
  if (isLoading) {
    // ... Skeleton loader ...
    return <div>Carregando...</div>;
  }

  // Normalize archetype from database (accepts both PT/EN and capitalized/lowercase)
  const normalizeArchetype = (archetype?: string | null): keyof typeof archetypeData => {
    if (!archetype) return 'equilibrist';
    const normalized = archetype.toLowerCase();
    if (normalized.includes('invest')) return 'investor';
    if (normalized.includes('equilib')) return 'equilibrist';
    if (normalized.includes('piloto') || normalized.includes('rescue') || normalized.includes('resgate')) return 'rescuer';
    return 'equilibrist';
  };

  const currentArchetype = archetypeData[normalizeArchetype(userData?.financial_archetype)];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="p-6">
        <div className="flex items-center mb-4">
          <BackButton to="/profile" className="mr-2" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-display">Meu Diagnóstico</h1>
            <p className="text-muted-foreground">Seu perfil e evolução financeira</p>
          </div>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Financial Archetype Card */}
        <div className="card-nexus">
          <div className="flex items-center mb-4">
            <Brain className="text-primary mr-2" size={24} />
            <h3 className="text-lg font-semibold text-foreground">Seu Arquétipo Financeiro</h3>
          </div>
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{currentArchetype.icon}</div>
            <h2 className="text-2xl font-bold text-display mb-2">
              {currentArchetype.name}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {currentArchetype.description}
            </p>
          </div>
        </div>

        {/* ... outros cards (Renda Base, etc) ... */}

        <div className="card-nexus">
          <NexusButton 
            onClick={handleRecalibrate}
            className="w-full"
            variant="outline"
          >
            <RefreshCw size={16} className="mr-2" />
            Recalibrar Diagnóstico
          </NexusButton>
        </div>
      </div>
    </div>
  );
};

export default MyDiagnostic;
