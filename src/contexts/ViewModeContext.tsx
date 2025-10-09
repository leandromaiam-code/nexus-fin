import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFamilyData } from '@/hooks/useSupabaseData';

type ViewMode = 'individual' | 'family';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  canViewFamily: boolean;
  familyId: number | null;
  isLoading: boolean;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const ViewModeProvider = ({ children }: { children: ReactNode }) => {
  const { data: familyData, isLoading } = useFamilyData();
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('nexus-view-mode');
    return (saved === 'family' || saved === 'individual') ? saved : 'individual';
  });

  const canViewFamily = !!familyData && !isLoading;
  const familyId = familyData?.id || null;

  const setViewMode = (mode: ViewMode) => {
    if (mode === 'family' && !canViewFamily) {
      console.warn('Não é possível mudar para visualização familiar sem família');
      return;
    }
    setViewModeState(mode);
    localStorage.setItem('nexus-view-mode', mode);
  };

  // Reset to individual if user no longer has family access
  useEffect(() => {
    if (!canViewFamily && viewMode === 'family') {
      setViewModeState('individual');
      localStorage.setItem('nexus-view-mode', 'individual');
    }
  }, [canViewFamily, viewMode]);

  return (
    <ViewModeContext.Provider 
      value={{ 
        viewMode, 
        setViewMode, 
        canViewFamily, 
        familyId,
        isLoading 
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
};
