import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const FloatingAddButton = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Não mostrar em telas de login, signup, onboarding e diagnóstico
  const hiddenRoutes = ['/login', '/signup', '/onboarding', '/onboarding-flow', '/diagnostic'];
  
  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/register')}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        bg-gradient-nexus rounded-full p-4 shadow-nexus
        hover:shadow-nexus-lg hover:scale-110
        transition-all duration-300
        flex items-center justify-center"
      aria-label="Adicionar transação"
    >
      <Plus size={28} className="text-white" />
    </button>
  );
};

export default FloatingAddButton;
