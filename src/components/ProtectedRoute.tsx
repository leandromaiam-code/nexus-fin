import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, session } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary rounded-full animate-pulse mx-auto"></div>
          <p className="text-muted-foreground">
            {session ? "Preparando sua conta..." : "Carregando..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user && !session) {
    return <Navigate to="/login" replace />;
  }

  if (!user && session) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;