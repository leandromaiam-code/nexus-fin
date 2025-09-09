import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import nexusLogo from '@/assets/nexus-logo.png';

const Login: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, digite seu nome completo.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const result = await login(fullName.trim(), password);
    
    if (result.success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao Nexus Co-Piloto.",
        variant: "default",
      });
      navigate('/');
    } else {
      toast({
        title: "Erro no login",
        description: result.error,
        variant: "destructive",
      });
    }
    
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <img 
            src={nexusLogo} 
            alt="Nexus Co-Piloto" 
            className="w-20 h-20 object-contain"
          />
          <div className="text-center">
            <h1 className="text-display text-3xl">Nexus Co-Piloto</h1>
            <p className="text-muted-foreground mt-2">
              Seu assistente financeiro inteligente
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="card-nexus">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground">
                Nome Completo
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Digite seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-background border-border text-foreground"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite qualquer senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border text-foreground"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Por enquanto, qualquer senha será aceita
              </p>
            </div>

            <Button
              type="submit"
              className="w-full btn-nexus"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Não tem conta?{' '}
            <button
              onClick={() => navigate('/onboarding')}
              className="text-primary hover:underline"
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;