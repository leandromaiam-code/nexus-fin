import React, { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import AppSidebar from '@/components/layout/AppSidebar';

interface DashboardHeaderProps {
  userName: string;
  financialArchetype: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  userName, 
  financialArchetype 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between p-6 bg-background">
        <div className="flex items-center space-x-3">
          <button 
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} className="text-foreground" />
          </button>
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

      <AppSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </>
  );
};

export default DashboardHeader;