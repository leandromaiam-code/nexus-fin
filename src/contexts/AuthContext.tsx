import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthChangeEvent, Session, User as AuthUser } from '@supabase/supabase-js';
import { isDiagnosticComplete } from '@/lib/diagnosticUtils';

// Este é o nosso tipo de perfil de usuário da tabela public.users
interface UserProfile {
  id: number;
  full_name: string | null;
  phone_number: string;
  financial_archetype?: string | null;
  income_input_typical?: number | null;
  income_input_best?: number | null;
  income_input_worst?: number | null;
  cost_of_living_reported?: number | null;
  renda_base_amount?: number | null;
  created_at?: string;
  auth_id?: string | null;
  confirmar_registros?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  session: Session | null;
  login: (credentials: {email: string, password: string}) => Promise<any>;
  signUp: (credentials: {email: string, password: string, fullName: string, phoneNumber: string}) => Promise<any>;
  logout: () => void;
  hasCompleteDiagnostic: () => boolean;
  resetPassword: (email: string) => Promise<any>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<{error: any}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async (authUser: AuthUser | null) => {
      setIsLoading(true);
      if (!authUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        setUser(null);
      } else {
        setUser(profile as UserProfile);
      }
      setIsLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async ({ email, password }: {email: string, password: string}) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async ({ email, password, fullName, phoneNumber }: {email: string, password: string, fullName: string, phoneNumber: string}) => {
    return supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          phone_number: phoneNumber
        }
      }
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const hasCompleteDiagnostic = (): boolean => {
    return user ? isDiagnosticComplete(user) : false;
  };

  const resetPassword = async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: { message: 'Usuário não autenticado' } };
    
    // Remove id from updates to prevent TypeScript error
    const { id, ...updateData } = updates;
    
    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id);
    
    if (!error) {
      setUser({ ...user, ...updateData });
    }
    
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, signUp, logout, hasCompleteDiagnostic, resetPassword, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
