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
      <header className="flex items-center justify-between p-4 sm:p-6 bg-background">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button 
            className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} className="text-foreground sm:hidden" />
            <Menu size={24} className="text-foreground hidden sm:block" />
          </button>
          <div>
            <h1 className="text-display text-lg sm:text-xl">
              Olá, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {financialArchetype}
            </p>
          </div>
        </div>
        
        <button className="relative p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell size={20} className="text-foreground sm:hidden" />
          <Bell size={24} className="text-foreground hidden sm:block" />
          <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-2.5 sm:w-3 h-2.5 sm:h-3 bg-primary rounded-full"></div>
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