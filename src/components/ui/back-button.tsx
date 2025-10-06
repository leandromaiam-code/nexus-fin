import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to, label, className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "p-2 rounded-lg hover:bg-muted transition-colors",
        className
      )}
      aria-label={label || "Voltar"}
    >
      <ArrowLeft size={20} className="text-foreground" />
    </button>
  );
};

export default BackButton;
