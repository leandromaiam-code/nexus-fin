import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateGoal } from '@/hooks/useSupabaseData';

interface EditGoalModalProps {
  goal: any;
  isOpen: boolean;
  onClose: () => void;
}

export const EditGoalModal = ({ goal, isOpen, onClose }: EditGoalModalProps) => {
  const [formData, setFormData] = useState({
    custom_name: '',
    target_amount: '',
    target_date: '',
    current_amount: ''
  });

  const updateGoalMutation = useUpdateGoal();

  useEffect(() => {
    if (goal) {
      setFormData({
        custom_name: goal.custom_name || goal.goal_templates?.name || '',
        target_amount: goal.target_amount?.toString() || '',
        target_date: goal.target_date || '',
        current_amount: goal.current_amount?.toString() || '0'
      });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateGoalMutation.mutateAsync({
        goalId: goal.id,
        goalData: {
          custom_name: formData.custom_name,
          target_amount: parseFloat(formData.target_amount),
          target_date: formData.target_date || undefined,
          current_amount: parseFloat(formData.current_amount)
        }
      });
      onClose();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Meta</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="custom_name">Nome da Meta</Label>
            <Input
              id="custom_name"
              value={formData.custom_name}
              onChange={(e) => setFormData({ ...formData, custom_name: e.target.value })}
              placeholder="Nome da meta"
              required
            />
          </div>

          <div>
            <Label htmlFor="target_amount">Valor da Meta</Label>
            <Input
              id="target_amount"
              type="number"
              step="0.01"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="current_amount">Valor Atual</Label>
            <Input
              id="current_amount"
              type="number"
              step="0.01"
              value={formData.current_amount}
              onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
              placeholder="0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="target_date">Data da Meta (opcional)</Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={updateGoalMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={updateGoalMutation.isPending}
            >
              {updateGoalMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};