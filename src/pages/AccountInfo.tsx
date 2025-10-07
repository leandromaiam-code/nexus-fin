import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, User, Lock, Calendar } from 'lucide-react';
import BackButton from '@/components/ui/back-button';
import { NexusButton } from '@/components/ui/nexus-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const accountSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(100, "Nome muito longo"),
  phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Telefone inválido (ex: +5511999999999)")
});

type AccountFormData = z.infer<typeof accountSchema>;

const AccountInfo = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      phone_number: user?.phone_number || ''
    }
  });

  useEffect(() => {
    const fetchEmail = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser?.email) setEmail(authUser.email);
    };
    fetchEmail();
  }, []);

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        phone_number: user.phone_number || ''
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: AccountFormData) => {
    setIsLoading(true);
    try {
      const updates = {
        full_name: data.full_name,
        phone_number: data.phone_number
      };

      const { error } = await updateUserProfile(updates);
      
      if (error) {
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Perfil atualizado",
          description: "Suas informações foram salvas com sucesso."
        });
        navigate('/profile');
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-20 md:pb-0">
      <header className="p-4 sm:p-6 border-b border-border">
        <BackButton to="/profile" className="mb-3" />
        <h1 className="text-xl sm:text-2xl font-bold text-display mb-2">Informações Pessoais</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Gerencie seus dados cadastrais</p>
      </header>

      <div className="px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome Completo */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="flex items-center gap-2">
              <User size={16} className="text-primary" />
              Nome Completo
            </Label>
            <Input
              id="full_name"
              {...register('full_name')}
              placeholder="Digite seu nome completo"
              className={errors.full_name ? 'border-destructive' : ''}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          {/* Email (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail size={16} className="text-primary" />
              Email
            </Label>
            <Input
              id="email"
              value={email}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">O email não pode ser alterado nesta tela</p>
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone_number" className="flex items-center gap-2">
              <Phone size={16} className="text-primary" />
              Telefone
            </Label>
            <Input
              id="phone_number"
              {...register('phone_number')}
              placeholder="+5511999999999"
              className={errors.phone_number ? 'border-destructive' : ''}
            />
            {errors.phone_number && (
              <p className="text-xs text-destructive">{errors.phone_number.message}</p>
            )}
          </div>

          {/* Alterar Senha */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Lock size={16} className="text-primary" />
              Senha
            </Label>
            <NexusButton
              type="button"
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/reset-password')}
            >
              Alterar Senha
            </NexusButton>
          </div>

          {/* Data de Criação da Conta */}
          {user?.created_at && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                Membro desde
              </Label>
              <Input
                value={new Date(user.created_at).toLocaleDateString('pt-BR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
                disabled
                className="bg-muted cursor-not-allowed"
              />
            </div>
          )}

          {/* Botões de Ação */}
          <div className="pt-4 space-y-3">
            <NexusButton
              type="submit"
              variant="nexus"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </NexusButton>
            
            <NexusButton
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/profile')}
              disabled={isLoading}
            >
              Cancelar
            </NexusButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountInfo;
