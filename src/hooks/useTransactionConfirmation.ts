import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface TransactionData {
  description: string;
  amount: number;
  category_id?: number;
  conta_pagadora_id?: number;
  transaction_date: string;
}

export const useTransactionConfirmation = () => {
  const { user } = useAuth();
  const [needsConfirmation, setNeedsConfirmation] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserPreference();
  }, [user]);

  const loadUserPreference = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users' as any)
        .select('confirmar_registros')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setNeedsConfirmation((data as any)?.confirmar_registros ?? true);
    } catch (error) {
      console.error('Erro ao carregar preferência:', error);
      setNeedsConfirmation(true); // Padrão: sempre confirmar
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (confirm: boolean) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('users' as any)
        .update({ confirmar_registros: confirm } as any)
        .eq('id', user.id);

      if (error) throw error;

      setNeedsConfirmation(confirm);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar preferência:', error);
      return false;
    }
  };

  return {
    needsConfirmation,
    isLoading,
    updatePreference
  };
};
