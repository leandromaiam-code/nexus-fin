import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const FloatingAddButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Não mostrar em telas de login, signup, onboarding e diagnóstico
  const hiddenRoutes = ['/login', '/signup', '/onboarding', '/onboarding-flow', '/diagnostic'];
  
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/register')}
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "rounded-full p-4 flex items-center justify-center",
        "transition-all duration-300 hover:scale-110",
        theme === 'dark' 
          ? "bg-gradient-nexus shadow-nexus hover:shadow-nexus-lg" 
          : "bg-primary shadow-lg hover:shadow-xl ring-2 ring-primary/20"
      )}
      aria-label="Adicionar transação"
    >
      <Plus size={28} className="text-white" />
    </button>
  );
};

export default FloatingAddButton;
