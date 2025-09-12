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
import { useAuth } from '@/contexts/AuthContext';
import { executeWebAction } from '@/lib/n8nClient';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
          description: "Arquétipo e perfil financeiro",
          action: () => navigate("/my-diagnostic")
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

  const MenuItem = ({ item }: { item: any }) => (
    <button
      onClick={item.action}
      className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-muted transition-colors group"
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
          <item.icon className="text-primary" size={20} />
        </div>
        <div className="text-left">
          <p className="font-medium text-foreground">{item.label}</p>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
      </div>
      <ChevronRight className="text-muted-foreground group-hover:text-foreground transition-colors" size={20} />
    </button>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="p-6">
        <h1 className="text-2xl font-bold text-display mb-2">Perfil</h1>
        <p className="text-muted-foreground">Gerencie sua conta e configurações</p>
      </header>

      <div className="px-6 space-y-6">
        {/* User Info Card */}
        <div className="card-nexus">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-nexus rounded-full flex items-center justify-center">
              <User className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-display">{user?.full_name}</h2>
              <p className="text-sm text-primary font-medium">{user?.financial_archetype}</p>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
              <Settings className="mr-2 text-primary" size={20} />
              {section.title}
            </h3>
            <div className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <MenuItem key={itemIndex} item={item} />
              ))}
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          <NexusButton 
            variant="ghost"
            className="w-full"
            onClick={logout}
          >
            <LogOut size={16} className="mr-2" />
            Sair da Conta
          </NexusButton>
          <NexusButton 
            variant="destructive" 
            className="w-full"
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
