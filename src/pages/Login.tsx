import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await login({ email, password });
    
    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo(a) de volta!"
      });
      navigate('/');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md shadow-lg">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-center text-lg sm:text-xl">Acessar o Nexus</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">Bem-vindo(a) de volta.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="email" className="text-sm sm:text-base">Email</label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="password" className="text-sm sm:text-base">Senha</label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Sua senha" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Entrar'}
            </Button>
          </form>
           <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm">
              Não tem uma conta?{' '}
              <a href="/signup" className="underline text-primary">
                  Cadastre-se
              </a>
           </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
