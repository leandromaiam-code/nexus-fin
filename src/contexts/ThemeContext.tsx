import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'clean';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Verifica localStorage ou usa clean como padrão
    const stored = localStorage.getItem('nexus-theme') as Theme;
    return stored || 'clean';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove ambas as classes primeiro
    root.classList.remove('dark', 'clean');
    
    // Adiciona a classe do tema atual
    root.classList.add(theme);
    
    // Salva no localStorage
    localStorage.setItem('nexus-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'clean' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
