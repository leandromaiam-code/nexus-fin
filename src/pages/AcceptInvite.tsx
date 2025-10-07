import { useParams, useNavigate } from "react-router-dom";
import { useGetInviteByToken, useAcceptFamilyInvite } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const AcceptInvite = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: invite, isLoading, error } = useGetInviteByToken(token);
  const acceptInviteMutation = useAcceptFamilyInvite();

  useEffect(() => {
    // Se não estiver logado, redirecionar para login com retorno para esta página
    if (!authLoading && !user) {
      navigate(`/login?redirect=/aceitar-convite/${token}`);
    }
  }, [user, authLoading, navigate, token]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando convite...</p>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Convite Inválido</CardTitle>
            <CardDescription>
              Este convite não existe, já foi aceito ou expirou.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Ir para o Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAccept = async () => {
    try {
      await acceptInviteMutation.mutateAsync({
        inviteId: invite.id,
        token: invite.token,
      });
      navigate("/family");
    } catch (error) {
      console.error("Error accepting invite:", error);
    }
  };

  const handleDecline = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Convite para Família</CardTitle>
          <CardDescription>
            Você foi convidado(a) para fazer parte de uma família
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Família</p>
                <p className="font-medium">{invite.familias?.nome_familia}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Seu papel</p>
                <p className="font-medium">{invite.papel}</p>
              </div>
            </div>

            {invite.cota_mensal && (
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Cota mensal</p>
                  <p className="font-medium">
                    R$ {invite.cota_mensal.toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Convite expira em</p>
                <p className="font-medium">
                  {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Responsável pela família: <span className="font-medium">
                  {(invite.familias as any)?.responsavel?.full_name || invite.users?.full_name}
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDecline}
            >
              Recusar
            </Button>
            <Button
              className="flex-1"
              onClick={handleAccept}
              disabled={acceptInviteMutation.isPending}
            >
              {acceptInviteMutation.isPending ? "Aceitando..." : "Aceitar Convite"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvite;
