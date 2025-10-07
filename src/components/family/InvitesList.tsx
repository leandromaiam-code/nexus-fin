import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Copy } from "lucide-react";
import { useFamilyInvites, useCancelFamilyInvite } from "@/hooks/useSupabaseData";
import { toast } from "sonner";

interface InvitesListProps {
  familyId: number;
}

export const InvitesList = ({ familyId }: InvitesListProps) => {
  const { data: invites, isLoading } = useFamilyInvites(familyId);
  const cancelInviteMutation = useCancelFamilyInvite();

  const pendingInvites = invites?.filter(invite => invite.status === 'pending') || [];

  if (isLoading) {
    return null;
  }

  if (pendingInvites.length === 0) {
    return null;
  }

  const handleCopyLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/aceitar-convite/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Link copiado!");
  };

  const handleCancelInvite = (inviteId: number) => {
    if (confirm("Tem certeza que deseja cancelar este convite?")) {
      cancelInviteMutation.mutate(inviteId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Convites Pendentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingInvites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{invite.papel}</Badge>
                {invite.cota_mensal && (
                  <span className="text-sm text-muted-foreground">
                    R$ {invite.cota_mensal.toFixed(2)}/mês
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Expira em: {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleCopyLink(invite.token)}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleCancelInvite(invite.id)}
                disabled={cancelInviteMutation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
