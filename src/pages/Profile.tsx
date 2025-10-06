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
  BarChart3
} from 'lucide-react';
import { NexusButton } from '@/components/ui/nexus-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { executeWebAction } from '@/lib/n8nClient';
import { toast } from '@/hooks/use-toast';
import { isDiagnosticComplete } from '@/lib/diagnosticUtils';
import { useUserData } from '@/hooks/useSupabaseData';
import { Switch } from '@/components/ui/switch';
import { useTransactionConfirmation } from '@/hooks/useTransactionConfirmation';
import BackButton from '@/components/ui/back-button';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: userData } = useUserData();
  const { needsConfirmation, updatePreference } = useTransactionConfirmation();

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
          action: () => toast({ title: "Em breve", description: "Edição de perfil em desenvolvimento." })
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
    },
    {
      title: "Aparência",
      items: [
        {
          icon: Palette,
          label: "Tema do Aplicativo",
          description: "Alternar entre modo Dark e Clean",
          action: null,
          isThemeToggle: true
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
    if (item.isThemeToggle) {
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
          <ThemeToggle />
        </div>
      );
    }

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
        <BackButton to="/dashboard" className="mb-3" />
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
