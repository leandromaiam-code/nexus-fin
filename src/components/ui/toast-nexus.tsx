import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastNexusProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'destructive' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

const variantConfig = {
  default: {
    icon: Info,
    className: 'bg-card border-border text-card-foreground',
    iconColor: 'text-primary'
  },
  success: {
    icon: CheckCircle,
    className: 'bg-success/10 border-success/20 text-success-foreground',
    iconColor: 'text-success'
  },
  destructive: {
    icon: XCircle,
    className: 'bg-destructive/10 border-destructive/20 text-destructive-foreground',
    iconColor: 'text-destructive'
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-warning/10 border-warning/20 text-warning-foreground',
    iconColor: 'text-warning'
  },
  info: {
    icon: Info,
    className: 'bg-primary/10 border-primary/20 text-primary-foreground',
    iconColor: 'text-primary'
  }
};

export const ToastNexus: React.FC<ToastNexusProps> = ({
  id,
  title,
  description,
  variant = 'default',
  onClose
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      id={id}
      className={cn(
        "relative p-4 rounded-lg border shadow-card backdrop-blur-sm animate-slide-up",
        "transition-all duration-300 hover:shadow-lg",
        config.className
      )}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        <Icon className={cn("flex-shrink-0 mt-0.5", config.iconColor)} size={20} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <p className="font-semibold text-sm mb-1">
              {title}
            </p>
          )}
          {description && (
            <p className="text-sm opacity-90">
              {description}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className={cn(
            "flex-shrink-0 p-1 rounded-full transition-colors",
            "hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
          )}
          aria-label="Fechar notificação"
        >
          <X size={16} className="opacity-60 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};

// Toast Provider Context
interface ToastContextType {
  showToast: (toast: Omit<ToastNexusProps, 'id' | 'onClose'>) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToastNexus = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToastNexus must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastNexusProps[]>([]);

  const showToast = React.useCallback((toast: Omit<ToastNexusProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastNexusProps = {
      ...toast,
      id,
      onClose: () => removeToast(id)
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 w-full max-w-sm space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastNexus {...toast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};