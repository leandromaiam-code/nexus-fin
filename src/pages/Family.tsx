import { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFamilyData, useFamilyMembers } from '@/hooks/useSupabaseData';
import FamilyMemberCard from '@/components/family/FamilyMemberCard';
import AddMemberModal from '@/components/family/AddMemberModal';
import BackButton from '@/components/ui/back-button';

const Family = () => {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const { data: familyData, isLoading: isFamilyLoading } = useFamilyData();
  const { data: members = [], isLoading: isMembersLoading } = useFamilyMembers();

  const isResponsavel = familyData?.userRole === 'Responsável';
  const totalCota = members.reduce((sum, m) => sum + (Number(m.cota_mensal) || 0), 0);

  if (isFamilyLoading || isMembersLoading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados da família...</p>
        </div>
      </div>
    );
  }

  if (!familyData) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <BackButton to="/" className="mb-4" />

          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Você não está em uma família</h3>
              <p className="text-muted-foreground mb-4">
                Configure sua família no onboarding ou crie uma nova
              </p>
              <Button onClick={() => navigate('/onboarding-flow')}>
                Configurar Família
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BackButton to="/" />
              <div>
                <h1 className="text-2xl font-bold">{familyData.nome_familia}</h1>
                <p className="text-sm text-muted-foreground">
                  {members.length} {members.length === 1 ? 'membro' : 'membros'}
                </p>
              </div>
            </div>

            {isResponsavel && (
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Membro
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Membros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{members.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cota Total Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(totalCota)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Seu Papel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{familyData.userRole}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Membros da Família</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <FamilyMemberCard
                key={member.id}
                member={member}
                isResponsavel={isResponsavel}
              />
            ))}
          </div>
        </div>
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        familyId={familyData.id}
      />
    </div>
  );
};

export default Family;
