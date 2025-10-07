import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Settings, 
  FileText, 
  Palette, 
  Shield, 
  LogOut, 
  ChevronRight,
  Target,
  BarChart3,
  Crown,
  Calendar
} from 'lucide-react';
import { NexusButton } from '@/components/ui/nexus-button';
import { useAuth } from '@/contexts/AuthContext';
import { executeWebAction } from '@/lib/n8nClient';
import { toast } from '@/hooks/use-toast';
import { isDiagnosticComplete } from '@/lib/diagnosticUtils';
import { useUserData } from '@/hooks/useSupabaseData';
import { Switch } from '@/components/ui/switch';
import { useTransactionConfirmation } from '@/hooks/useTransactionConfirmation';
import BackButton from '@/components/ui/back-button';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: userData } = useUserData();
  const { needsConfirmation, updatePreference } = useTransactionConfirmation();
  const { subscription, createBillingPortalSession, isCreatingPortal } = useSubscription();

  const handleDiagnosticClick = () => {
    if (!userData || !isDiagnosticComplete(userData)) {
      navigate('/diagnostic');
    } else {
      navigate('/my-diagnostic');
    }
  };

  const menuSections = [
    {
      title: "Minha Conta",
      items: [
        {
          icon: User,
          label: "Informações Pessoais",
          description: "Nome, email e dados básicos",
          action: () => navigate("/account-info")
        },
        {
          icon: FileText,
          label: "Meu Diagnóstico",
          description: userData && isDiagnosticComplete(userData) ? "Arquétipo e perfil financeiro" : "Complete seu diagnóstico financeiro",
          action: handleDiagnosticClick
        }
      ]
    },
    {
      title: "Meu Plano",
      items: [
        {
          icon: Target,
          label: "Gerenciar Categorias",
          description: "Personalizar plano de contas",
          action: () => navigate("/manage-categories")
        },
        {
          icon: BarChart3,
          label: "Configurar Metas",
          description: "Definir objetivos financeiros",
          action: () => navigate('/plan')
        }
      ]
    },
    {
      title: "Preferências",
      items: [
        {
          icon: Shield,
          label: "Confirmar Transações",
          description: "Revisar antes de salvar",
          action: null,
          isConfirmToggle: true
        }
      ]
    }
  ];

  const handleDeleteAccount = async () => {
    if (confirm("Você tem certeza ABSOLUTA que deseja excluir sua conta? Todos os seus dados serão perdidos permanentemente.")) {
        try {
            await executeWebAction('DELETE_ACCOUNT');
            toast({ title: "Conta Excluída", description: "Sua conta e todos os dados foram removidos." });
            logout(); // Faz o logout do front-end
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    }
  };

  const MenuItem = ({ item }: { item: any }) => {
    if (item.isConfirmToggle) {
      return (
        <div className="w-full flex items-center justify-between p-3 sm:p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <item.icon className="text-primary" size={18} />
            </div>
            <div className="text-left min-w-0 flex-1">
              <p className="font-medium text-foreground text-sm sm:text-base">{item.label}</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{item.description}</p>
            </div>
          </div>
          <Switch 
            checked={needsConfirmation}
            onCheckedChange={updatePreference}
          />
        </div>
      );
    }

    return (
      <button
        onClick={item.action}
        className="w-full flex items-center justify-between p-3 sm:p-4 bg-card rounded-xl border border-border hover:bg-muted transition-colors group"
      >
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
          <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
            <item.icon className="text-primary" size={18} />
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="font-medium text-foreground text-sm sm:text-base">{item.label}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{item.description}</p>
          </div>
        </div>
        <ChevronRight className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" size={18} />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-20 md:pb-0">
      <header className="p-4 sm:p-6">
        <BackButton to="/" className="mb-3" />
        <h1 className="text-xl sm:text-2xl font-bold text-display mb-2">Perfil</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Gerencie sua conta e configurações</p>
      </header>

      <div className="px-4 sm:px-6 space-y-4 sm:space-y-6">
        {/* User Info Card */}
        <div className="card-nexus">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-nexus rounded-full flex items-center justify-center flex-shrink-0">
              <User className="text-white" size={20} />
            </div>
            <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-display truncate">{user?.full_name}</h2>
            <p className="text-xs sm:text-sm text-primary font-medium">{user?.financial_archetype}</p>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="card-nexus">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Crown className="text-primary" size={18} />
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Sua Assinatura</h3>
            </div>
            {subscription?.plan_type === 'premium' && (
              <span className="text-xs bg-gradient-nexus text-white px-2 py-1 rounded-full">Premium</span>
            )}
            {subscription?.plan_type === 'plus' && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Plus</span>
            )}
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Plano atual:</span>
              <span className="font-semibold capitalize">{subscription?.plan_type || 'free'}</span>
            </div>
            
            {subscription?.current_period_end && subscription.plan_type !== 'free' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Renova em:</span>
                <span className="font-medium">
                  {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            
            {subscription?.status && subscription.plan_type !== 'free' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${
                  subscription.status === 'active' ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {subscription.status === 'active' ? 'Ativo' : subscription.status}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-sm"
              onClick={() => navigate('/pricing')}
            >
              {subscription?.plan_type === 'free' ? 'Ver Planos' : 'Mudar Plano'}
            </Button>
            
            {subscription?.stripe_customer_id && subscription.plan_type !== 'free' && (
              <Button
                variant="outline"
                className="flex-1 text-sm"
                onClick={() => navigate('/subscription')}
              >
                <Settings size={14} className="mr-1" />
                Ver Detalhes
              </Button>
            )}
          </div>
        </div>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3 flex items-center">
              <Settings className="mr-2 text-primary" size={18} />
              {section.title}
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {section.items.map((item, itemIndex) => (
                <MenuItem key={itemIndex} item={item} />
              ))}
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="pt-3 sm:pt-4 space-y-2.5 sm:space-y-3">
          <NexusButton 
            variant="ghost"
            className="w-full text-sm sm:text-base"
            onClick={logout}
          >
            <LogOut size={16} className="mr-2" />
            Sair da Conta
          </NexusButton>
          <NexusButton 
            variant="destructive" 
            className="w-full text-sm sm:text-base"
            onClick={handleDeleteAccount}
          >
            Excluir Minha Conta Permanentemente
          </NexusButton>
        </div>
      </div>
    </div>
  );
};

export default Profile;
