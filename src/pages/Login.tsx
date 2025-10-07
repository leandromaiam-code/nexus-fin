import React, 'useState' from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import LogoWhite from '@/assets/LogoNexus-white.png';
import LogoBlack from '@/assets/LogoNexus-Black.png';

const Login = () => {
  // ... (toda a sua lógica de state e funções continua a mesma)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const { login, resetPassword } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => { /* ... */ };
  const handleResetPassword = async (e: React.FormEvent) => { /* ... */ };

  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center justify-center p-3 sm:p-4 overflow-hidden">
      {/* Background Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src={theme === 'dark' ? LogoBlack : LogoWhite}
          alt="Nexus Background"
          // ✅ ALTERAÇÃO 3: Imagem de fundo ampliada em mais de 30% (de 800px para 1050px)
          className="w-[1050px] max-w-[120vw] opacity-5"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* O logo que ficava aqui foi removido e movido para dentro do CardHeader */}
        <Card className="w-full max-w-sm sm:max-w-md shadow-lg">
          {/* ✅ ALTERAÇÃO 1: Adicionado flexbox para centralizar a logo que está aqui dentro agora */}
          <CardHeader className="p-4 sm:p-6 flex flex-col items-center">
            
            {/* ✅ ALTERAÇÃO 1: Logo movida para DENTRO do card e com uma margem inferior */}
            <img
              src={theme === 'dark' ? LogoBlack : LogoWhite}
              alt="Nexus Logo"
              className="h-8 sm:h-10 mb-4" // Adicionada margem inferior
            />

            {/* O CardTitle "Acessar o Nexus" foi removido para dar lugar à logo */}
            
            {/* ✅ ALTERAÇÃO 2: Texto corrigido e ajustado */}
            <CardDescription className="text-center text-sm sm:text-base">
              Bem-vindo de volta.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* ... (o resto do formulário continua igual) ... */}
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
            <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm space-y-2">
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-primary hover:underline"
              >
                Esqueceu sua senha?
              </button>
              <div>
                Não tem uma conta?{' '}
                <a href="/signup" className="underline text-primary">
                  Cadastre-se
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal não foi alterado */}
        <Dialog open={showResetModal} onOpenChange={setShowResetModal}>{/* ... */}</Dialog>
      </div>
    </div>
  );
};

export default Login;