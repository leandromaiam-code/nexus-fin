import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, MessageCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface InviteShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  papel: string;
  expiresAt: string;
}

export const InviteShareDialog = ({ isOpen, onClose, token, papel, expiresAt }: InviteShareDialogProps) => {
  const [copied, setCopied] = useState(false);
  const inviteUrl = `${window.location.origin}/aceitar-convite/${token}`;
  
  const expirationDate = new Date(expiresAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success("Link copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const message = `Olá! Você foi convidado(a) para fazer parte da nossa família como ${papel}. Acesse o link para aceitar o convite: ${inviteUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Convite Gerado com Sucesso!</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Compartilhe este link com a pessoa que você deseja convidar:
            </p>
            
            <div className="flex gap-2">
              <Input
                value={inviteUrl}
                readOnly
                className="flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              <strong>Papel:</strong> {papel}
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Validade:</strong> até {expirationDate}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleShareWhatsApp}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Compartilhar no WhatsApp
            </Button>
          </div>

          <Button onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
