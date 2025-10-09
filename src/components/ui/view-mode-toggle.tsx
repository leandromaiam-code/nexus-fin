import { Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useViewMode } from '@/contexts/ViewModeContext';
import { Button } from './button';
import { Skeleton } from './skeleton';

export const ViewModeToggle = () => {
  const { viewMode, setViewMode, canViewFamily, isLoading } = useViewMode();

  if (isLoading) {
    return <Skeleton className="h-10 w-48" />;
  }

  if (!canViewFamily) {
    return null;
  }

  return (
    <div className="inline-flex rounded-lg border border-border bg-background p-1 gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode('individual')}
        className={cn(
          "transition-all",
          viewMode === 'individual'
            ? "bg-primary text-primary-foreground shadow-sm"
            : "hover:bg-muted"
        )}
      >
        <User className="h-4 w-4 mr-2" />
        Individual
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode('family')}
        className={cn(
          "transition-all",
          viewMode === 'family'
            ? "bg-primary text-primary-foreground shadow-sm"
            : "hover:bg-muted"
        )}
      >
        <Users className="h-4 w-4 mr-2" />
        Família
      </Button>
    </div>
  );
};
