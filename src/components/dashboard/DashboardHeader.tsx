import React from 'react';
import { Bell } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface DashboardHeaderProps {
  userName: string;
  financialArchetype: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  userName, 
  financialArchetype 
}) => {
  return (
    <header className="flex items-center justify-between p-6 bg-background border-b border-border">
      <div className="flex items-center space-x-3">
        <SidebarTrigger className="p-2 rounded-lg hover:bg-muted transition-colors" />
        <div>
          <h1 className="text-display text-xl">
            Olá, {userName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {financialArchetype}
          </p>
        </div>
      </div>
      
      <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
        <Bell size={24} className="text-foreground" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
      </button>
    </header>
  );
};

export default DashboardHeader;