import React from 'react';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface CategoryIconProps {
  iconName?: string | null;
  className?: string;
  size?: number;
}

export const CategoryIcon = ({ iconName, className, size = 20 }: CategoryIconProps) => {
  // Convert icon name to PascalCase for lucide-react
  const getIconComponent = (name: string): LucideIcon => {
    const iconKey = name
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('') as keyof typeof Icons;
    
    return (Icons[iconKey] as LucideIcon) || Icons.HelpCircle;
  };

  const Icon = iconName ? getIconComponent(iconName) : Icons.HelpCircle;

  return <Icon size={size} className={className} />;
};
