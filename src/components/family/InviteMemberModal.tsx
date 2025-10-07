import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateFamilyInvite } from "@/hooks/useSupabaseData";
import { InviteShareDialog } from "./InviteShareDialog";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: number;
}

export const InviteMemberModal = ({ isOpen, onClose, familyId }: InviteMemberModalProps) => {
  const [papel, setPapel] = useState<string>("");
  const [cotaMensal, setCotaMensal] = useState<string>("");
  const [generatedInvite, setGeneratedInvite] = useState<any>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  const createInviteMutation = useCreateFamilyInvite();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!papel) {
      return;
    }

    try {
      const invite = await createInviteMutation.mutateAsync({
        familyId,
        papel,
        cotaMensal: cotaMensal ? parseFloat(cotaMensal) : undefined,
      });
      
      setGeneratedInvite(invite);
      setShowShareDialog(true);
    } catch (error) {
      console.error("Error creating invite:", error);
    }
  };

  const handleClose = () => {
    setPapel("");
    setCotaMensal("");
    setGeneratedInvite(null);
    setShowShareDialog(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen && !showShareDialog} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar Membro para a Família</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="papel">Papel na Família</Label>
              <Select value={papel} onValueChange={setPapel}>
                <SelectTrigger id="papel">
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cônjuge">Cônjuge</SelectItem>
                  <SelectItem value="Dependente">Dependente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cotaMensal">Cota Mensal (opcional)</Label>
              <Input
                id="cotaMensal"
                type="number"
                step="0.01"
                placeholder="R$ 0,00"
                value={cotaMensal}
                onChange={(e) => setCotaMensal(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createInviteMutation.isPending}>
                {createInviteMutation.isPending ? "Criando..." : "Gerar Convite"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {generatedInvite && (
        <InviteShareDialog
          isOpen={showShareDialog}
          onClose={handleClose}
          token={generatedInvite.token}
          papel={generatedInvite.papel}
          expiresAt={generatedInvite.expires_at}
        />
      )}
    </>
  );
};
