import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthChangeEvent, Session, User as AuthUser } from '@supabase/supabase-js';

// Este é o nosso tipo de perfil de usuário da tabela public.users
interface UserProfile {
  id: number;
  full_name: string;
  phone_number: string;
  financial_archetype?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  session: Session | null;
  login: (credentials: {email: string, password: string}) => Promise<any>;
  signUp: (credentials: {email: string, password: string, fullName: string, phoneNumber: string}) => Promise<any>;
  logout: () => void;
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
      async (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        await fetchUserProfile(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchUserProfile(session?.user ?? null);
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

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, signUp, logout }}>
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
