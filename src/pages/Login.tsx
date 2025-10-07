import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import LogoWhite from "@/assets/LogoNexus-white.png";
import LogoBlack from "@/assets/LogoNexus-Black.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const { login, resetPassword } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await login({ email, password });

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo(a) de volta!",
      });
      navigate(redirect || "/");
    }

    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setIsResetting(true);
    const { error } = await resetPassword(resetEmail);

    if (error) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      setShowResetModal(false);
      setResetEmail("");
    }

    setIsResetting(false);
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center justify-center p-3 sm:p-4 overflow-hidden">
      {/* Background Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src={theme === "dark" ? LogoBlack : LogoWhite}
          alt="Nexus Background"
          className="w-[1050px] max-w-[120vw] opacity-5"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full">
        <Card className="w-full max-w-sm sm:max-w-md shadow-lg">
          <CardHeader className="p-4 sm:p-6 flex flex-col items-center">
            <img src={theme === "dark" ? LogoBlack : LogoWhite} alt="Nexus Logo" className="h-32 sm:h-40 mb-16" />
            <CardDescription className="text-center text-sm sm:text-base">Bem-vindo de volta.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <label htmlFor="email" className="text-sm sm:text-base">
                  Email
                </label>
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
                <label htmlFor="password" className="text-sm sm:text-base">
                  Senha
                </label>
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
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Entrar"}
              </Button>
            </form>
            <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm space-y-2">
              <button type="button" onClick={() => setShowResetModal(true)} className="text-primary hover:underline">
                Esqueceu sua senha?
              </button>
              <div>
                Não tem uma conta?{" "}
                <a href="/signup" className="underline text-primary">
                  Cadastre-se
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reset Password Modal */}
        <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Redefinir Senha</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="text-sm">
                  Email
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowResetModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isResetting || !resetEmail} className="flex-1">
                  {isResetting ? <Loader2 className="animate-spin" size={16} /> : "Enviar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Login;
