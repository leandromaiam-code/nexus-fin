import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="transition-nexus hover:bg-muted"
          aria-label={`Mudar para modo ${theme === 'dark' ? 'clean' : 'dark'}`}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-foreground" />
          ) : (
            <Moon className="h-5 w-5 text-foreground" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{theme === 'dark' ? 'Modo Clean' : 'Modo Dark'}</p>
      </TooltipContent>
    </Tooltip>
  );
};
