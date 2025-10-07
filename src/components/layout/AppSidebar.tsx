import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  Plus, 
  BarChart3, 
  User,
  Stethoscope,
  LogOut,
  X,
  Users,
  Wallet,
  PiggyBank,
  TrendingUp,
  Lightbulb,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUserData } from '@/hooks/useSupabaseData';
import { getArchetypeName } from '@/lib/diagnosticUtils';
import LogoWhite from '@/assets/LogoNexus-white.png';
import LogoBlack from '@/assets/LogoNexus-Black.png';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { data: userData } = useUserData();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Painel',
      icon: LayoutDashboard,
      path: '/',
    },
    {
      id: 'family',
      label: 'Família',
      icon: Users,
      path: '/family',
    },
    {
      id: 'accounts',
      label: 'Contas',
      icon: Wallet,
      path: '/payment-accounts',
    },
    {
      id: 'budget',
      label: 'Orçamento',
      icon: PiggyBank,
      path: '/budget',
    },
    {
      id: 'plan',
      label: 'Plano',
      icon: Target,
      path: '/plan',
    },
    {
      id: 'register',
      label: 'Registrar',
      icon: Plus,
      path: '/register',
    },
    {
      id: 'analysis',
      label: 'Análise',
      icon: BarChart3,
      path: '/analysis',
    },
    {
      id: 'budget-analysis',
      label: 'Performance Orçamento',
      icon: Target,
      path: '/budget-analysis',
    },
    {
      id: 'spending-insights',
      label: 'Insights de Gastos',
      icon: Lightbulb,
      path: '/spending-insights',
    },
    {
      id: 'diagnostic',
      label: 'Diagnóstico',
      icon: Stethoscope,
      path: '/diagnostic',
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: User,
      path: '/profile',
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-72 sm:w-80 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <img 
            src={theme === 'dark' ? LogoWhite : LogoBlack} 
            alt="Nexus Logo" 
            className="h-8"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-6 border-b border-border bg-muted/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{user.full_name}</p>
                <p className="text-sm text-muted-foreground">{getArchetypeName(userData?.financial_archetype)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-3">
          {user ? (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair
            </Button>
          ) : (
            <Button
              onClick={() => {
                navigate('/login');
                onClose();
              }}
              className="w-full"
            >
              Fazer Login
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

export default AppSidebar;