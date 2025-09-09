import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: number;
  full_name: string;
  financial_archetype: string;
  auth_id: string | null;
  phone_number: string;
  renda_base_amount: number | null;
}

interface AuthContextType {
  user: User | null;
  login: (fullName: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('nexus-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (fullName: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Search for user by full_name in the users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('full_name', fullName)
        .single();

      if (error || !userData) {
        setIsLoading(false);
        return { 
          success: false, 
          error: 'Usuário não encontrado. Verifique o nome digitado.' 
        };
      }

      // For now, accept any password (as requested)
      const authenticatedUser: User = {
        id: userData.id,
        full_name: userData.full_name,
        financial_archetype: userData.financial_archetype || 'Não definido',
        auth_id: userData.auth_id,
        phone_number: userData.phone_number,
        renda_base_amount: userData.renda_base_amount
      };

      setUser(authenticatedUser);
      localStorage.setItem('nexus-user', JSON.stringify(authenticatedUser));
      setIsLoading(false);
      
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Erro ao fazer login. Tente novamente.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nexus-user');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};