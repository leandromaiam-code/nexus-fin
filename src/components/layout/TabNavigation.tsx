import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  Plus, 
  BarChart3, 
  User 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TabNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    {
      id: 'dashboard',
      label: 'Painel',
      icon: LayoutDashboard,
      path: '/',
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
      isCenter: true,
    },
    {
      id: 'analysis',
      label: 'Análise',
      icon: BarChart3,
      path: '/analysis',
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: User,
      path: '/profile',
    },
  ];

  // Não mostrar na tela de login, signup, onboarding e diagnóstico, ou se não há usuário
  if (['/login', '/signup', '/onboarding', '/diagnostic'].includes(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
      <nav className="flex items-center justify-around h-16 sm:h-20 px-2 sm:px-4 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center transition-nexus",
                tab.isCenter 
                  ? "bg-gradient-nexus rounded-full p-2 sm:p-3 -mt-4 sm:-mt-6 shadow-nexus" 
                  : "py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg",
                isActive && !tab.isCenter && "bg-muted",
                tab.isCenter && "text-white"
              )}
            >
              <Icon 
                size={tab.isCenter ? 22 : 18} 
                className={cn(
                  "transition-colors",
                  tab.isCenter 
                    ? "text-white" 
                    : isActive 
                      ? "text-primary" 
                      : "text-muted-foreground"
                )}
              />
              {!tab.isCenter && (
                <span 
                  className={cn(
                    "text-xs mt-0.5 font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default TabNavigation;