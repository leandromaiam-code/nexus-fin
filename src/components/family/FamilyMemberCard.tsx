import { useState } from "react";
import { Edit2, Trash2, User, Loader2 } from "lucide-react"; // 1. Adicionado Loader2 para o loading
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDeleteFamilyMember, useMemberCurrentSpending } from "@/hooks/useSupabaseData"; // 2. Importado o novo hook
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import QuotaManager from "./QuotaManager";

// ==================================================================
// NOVO HOOK: useMemberCurrentSpending
// (Este código deve ficar no seu arquivo de hooks, ex: @/hooks/useSupabaseData.ts)
// Vou incluí-lo aqui para facilitar, mas o ideal é movê-lo para o arquivo correto.
// ==================================================================
/*
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMemberCurrentSpending = (memberUserId: string | number) => {
  return useQuery({
    queryKey: ['memberSpending', memberUserId],
    queryFn: async () => {
      if (!memberUserId) return { total_spent: 0 };

      const { data, error } = await supabase
        .from('monthly_user_summary') // Usando a VIEW que criamos
        .select('total_spent')
        .eq('user_id', memberUserId)
        .limit(1) // Pega o mês mais recente, pois a VIEW está ordenada
        .single();

      if (error && error.code !== 'PGRST116') { // Ignora erro se não encontrar linhas
        throw new Error(error.message);
      }

      return data || { total_spent: 0 };
    },
  });
};
*/
// ==================================================================

interface FamilyMemberCardProps {
  member: any;
  isResponsavel: boolean;
}

const FamilyMemberCard = ({ member, isResponsavel }: FamilyMemberCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditQuotaOpen, setIsEditQuotaOpen] = useState(false);
  const deleteMember = useDeleteFamilyMember();

  // 3. BUSCAR o Gasto Atual usando o novo hook
  const { data: spendingData, isLoading: isSpendingLoading } = useMemberCurrentSpending(member.user_id);

  const handleDelete = async () => {
    try {
      await deleteMember.mutateAsync(member.id);
      toast.success("Membro removido com sucesso");
    } catch (error) {
      toast.error("Erro ao remover membro");
    }
  };

  const cotaMensal = Number(member.cota_mensal) || 0;

  // 4. USAR o dado buscado em vez do valor fixo '0'
  const gastoAtual = spendingData?.total_spent || 0;

  const percentualGasto = cotaMensal > 0 ? (gastoAtual / cotaMensal) * 100 : 0;

  const getPapelColor = (papel: string) => {
    // ... (nenhuma alteração nesta função)
    switch (papel) {
      case "Responsável":
        return "text-primary";
      case "Cônjuge":
        return "text-accent-foreground";
      case "Dependente":
        return "text-warning";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          {/* Nenhuma alteração na seção de identificação do membro */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {member.users?.full_name || member.users?.phone_number || "Usuário sem nome"}
                </h3>
                <p className={`text-sm font-medium ${getPapelColor(member.papel)}`}>{member.papel}</p>
              </div>
            </div>
            {isResponsavel && member.papel !== "Responsável" && (
              <div className="flex gap-1">{/* ... (nenhuma alteração nos botões) */}</div>
            )}
          </div>

          <div className="space-y-3">
            {/* Nenhuma alteração na seção de Cota Mensal */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Cota Mensal</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cotaMensal)}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Gasto Atual</span>

                {/* 5. EXIBIR um indicador de loading ou o valor formatado */}
                {isSpendingLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="font-semibold">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(gastoAtual)}
                  </span>
                )}
              </div>
              <Progress value={percentualGasto} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{percentualGasto.toFixed(0)}% utilizado</p>
            </div>

            {/* Nenhuma alteração na seção de Disponível */}
            {cotaMensal > gastoAtual && <div className="pt-2 border-t">{/* ... (código existente) */}</div>}
          </div>
        </CardContent>
      </Card>

      {/* Nenhuma alteração nos modais AlertDialog e QuotaManager */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        {/* ... (código existente) */}
      </AlertDialog>

      <QuotaManager isOpen={isEditQuotaOpen} onClose={() => setIsEditQuotaOpen(false)} member={member} />
    </>
  );
};

export default FamilyMemberCard;
