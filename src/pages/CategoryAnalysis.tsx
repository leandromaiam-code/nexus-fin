import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  TrendingDown, Receipt, Edit2, Trash2, Calendar, DollarSign,
  ShoppingCart, Home, Car, Utensils, Film, Heart, Briefcase, 
  GraduationCap, Smartphone, Plane, Gift, Zap, ShoppingBag, Cpu, PieChart as PieChartIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCategories, useRecentTransactions, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useSupabaseData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import BackButton from '@/components/ui/back-button';

const getCategoryIcon = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    'shopping-cart': ShoppingCart,
    'home': Home,
    'car': Car,
    'utensils': Utensils,
    'film': Film,
    'heart': Heart,
    'briefcase': Briefcase,
    'graduation-cap': GraduationCap,
    'smartphone': Smartphone,
    'plane': Plane,
    'gift': Gift,
    'zap': Zap,
    'shopping-bag': ShoppingBag,
    'cpu': Cpu,
  };
  
  return iconMap[iconName] || DollarSign;
};

const CategoryAnalysis = () => {
  const { categoryId } = useParams();

  // Fetch real data
  const { data: categories } = useCategories();
  const { data: allTransactions = [], isLoading } = useRecentTransactions(1000);
  
  // Filter by category - include subcategories
  const category = categories?.find(c => c.id === Number(categoryId));
  const subcategories = categories?.filter(c => c.parent_category_id === Number(categoryId)) || [];
  const subcategoryIds = subcategories.map(s => s.id);
  
  // Filter transactions from subcategories only (not parent category itself)
  const categoryTransactions = allTransactions.filter(
    t => subcategoryIds.includes(t.category_id)
  );
  
  const CategoryIcon = category ? getCategoryIcon(category.icon_name || '') : DollarSign;

  // States for edit/delete
  const [editTransaction, setEditTransaction] = useState<any>(null);
  const [deleteTransactionId, setDeleteTransactionId] = useState<number | null>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<number[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    category_id: '',
    transaction_date: ''
  });

  // Mutations
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  // Calculate totals
  const totalSpent = useMemo(() => {
    return categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [categoryTransactions]);

  // Monthly comparison (last 3 months)
  const monthlyComparison = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    
    categoryTransactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      
      monthlyData[monthKey] += Math.abs(transaction.amount);
    });

    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .slice(-3);
  }, [categoryTransactions]);

  // Subcategory data for donut chart
  const subcategoryData = useMemo(() => {
    const subcatMap: { [key: number]: { name: string; total: number; icon: string } } = {};
    
    // Agrupar transações por subcategoria
    categoryTransactions.forEach(transaction => {
      const subcat = subcategories.find(s => s.id === transaction.category_id);
      if (subcat) {
        if (!subcatMap[subcat.id]) {
          subcatMap[subcat.id] = {
            name: subcat.name,
            total: 0,
            icon: subcat.icon_name || ''
          };
        }
        subcatMap[subcat.id].total += Math.abs(transaction.amount);
      }
    });

    const colors = [
      '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
      '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16',
      '#A855F7', '#FB923C', '#22D3EE', '#F472B6', '#FACC15'
    ];

    return Object.entries(subcatMap).map(([id, data], index) => ({
      id: Number(id),
      name: data.name,
      value: data.total,
      color: colors[index % colors.length],
      icon: data.icon
    }));
  }, [categoryTransactions, categories, categoryId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Handlers
  const handleEditClick = (transaction: any) => {
    setEditTransaction(transaction);
    setEditForm({
      description: transaction.description || '',
      amount: Math.abs(transaction.amount).toString(),
      category_id: transaction.category_id?.toString() || '',
      transaction_date: transaction.transaction_date
    });
  };

  const handleEditSubmit = async () => {
    if (!editTransaction) return;
    
    try {
      await updateTransactionMutation.mutateAsync({
        transactionId: editTransaction.id,
        transactionData: {
          description: editForm.description,
          amount: -Math.abs(parseFloat(editForm.amount)),
          category_id: parseInt(editForm.category_id),
          transaction_date: editForm.transaction_date
        }
      });
      toast.success('Transação atualizada com sucesso!');
      setEditTransaction(null);
    } catch (error) {
      toast.error('Erro ao atualizar transação');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTransactionId) return;
    
    try {
      await deleteTransactionMutation.mutateAsync(deleteTransactionId);
      toast.success('Transação excluída com sucesso!');
      setDeleteTransactionId(null);
    } catch (error) {
      toast.error('Erro ao excluir transação');
    }
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteDialog(true);
  };

  const confirmBulkDelete = async () => {
    try {
      for (const id of selectedTransactions) {
        await deleteTransactionMutation.mutateAsync(id);
      }
      toast.success(`${selectedTransactions.length} transações excluídas com sucesso!`);
      setSelectedTransactions([]);
      setSelectMode(false);
      setShowBulkDeleteDialog(false);
    } catch (error) {
      toast.error('Erro ao excluir transações');
    }
  };

  const toggleTransactionSelection = (id: number) => {
    setSelectedTransactions(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="animate-pulse p-6 space-y-4">
          <div className="h-6 bg-muted rounded w-48"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Categoria não encontrada</h1>
          <BackButton to="/analysis" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="p-6">
        <BackButton to="/analysis" className="mb-4" />
        <div className="flex items-center">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-display flex items-center">
              <CategoryIcon size={28} className="mr-2 text-primary" />
              {category.name}
            </h1>
            <p className="text-muted-foreground">Análise Detalhada</p>
          </div>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Category Total Card */}
        <div className="card-nexus text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingDown className="text-destructive mr-2" size={24} />
            <h3 className="text-lg font-semibold text-foreground">Total da Categoria</h3>
          </div>
          <p className="text-3xl font-bold text-destructive text-financial">
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {categoryTransactions.length} transações
          </p>
        </div>

        {/* Subcategories Donut Chart */}
        {subcategoryData.length > 0 && (
          <div className="card-nexus">
            <div className="flex items-center mb-4">
              <PieChartIcon className="text-primary mr-2" size={18} />
              <h3 className="font-semibold text-foreground">Gastos por Subcategoria</h3>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Donut Chart */}
              <div className="flex-1 relative h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subcategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      label={({ percent }) => (percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : '')}
                      labelLine={false}
                    >
                      {subcategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Gasto']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center content */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Subcategorias</p>
                    <p className="text-lg font-bold text-primary">
                      {subcategoryData.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Compact Legend */}
              <div className="lg:w-64 space-y-0.5">
                <h4 className="font-semibold text-xs text-muted-foreground mb-2">Subcategorias</h4>
                {subcategoryData.map((subcat, index) => {
                  const percentage = ((subcat.value / totalSpent) * 100).toFixed(1);
                  return (
                    <div 
                      key={index} 
                      className="flex items-center gap-2 py-1 px-2 rounded hover:bg-accent/30 transition-colors"
                    >
                      <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: subcat.color }} />
                      <p className="text-xs font-medium truncate flex-1 text-foreground">{subcat.name}</p>
                      <p className="text-xs font-semibold text-muted-foreground">{percentage}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Monthly Comparison */}
        {monthlyComparison.length > 0 && (
          <div className="card-nexus">
            <h3 className="font-semibold text-foreground mb-4">
              Comparativo Mensal
            </h3>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(1)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Gasto']}
                    labelStyle={{ color: '#1F2937' }}
                    contentStyle={{ 
                      backgroundColor: '#161B22', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Transactions with Edit/Delete */}
        <div className="card-nexus">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Receipt className="text-primary mr-2" size={20} />
              <h3 className="font-semibold text-foreground">Transações</h3>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={selectMode ? "default" : "outline"}
                onClick={() => {
                  setSelectMode(!selectMode);
                  setSelectedTransactions([]);
                }}
              >
                {selectMode ? "Cancelar" : "Selecionar"}
              </Button>
              
              {selectMode && selectedTransactions.length > 0 && (
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleBulkDelete}
                >
                  Excluir ({selectedTransactions.length})
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {categoryTransactions.length > 0 ? (
              categoryTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  {selectMode && (
                    <Checkbox
                      checked={selectedTransactions.includes(transaction.id)}
                      onCheckedChange={() => toggleTransactionSelection(transaction.id)}
                    />
                  )}
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground text-sm">
                      {transaction.description || 'Sem descrição'}
                    </h4>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Calendar size={12} className="mr-1" />
                      <span>{formatDate(transaction.transaction_date)}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-destructive text-financial">
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                  </div>

                  {!selectMode && (
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleEditClick(transaction)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setDeleteTransactionId(transaction.id)}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Receipt size={48} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-foreground font-medium mb-1">Nenhuma transação</p>
                <p className="text-sm text-muted-foreground">
                  Não há transações nesta categoria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      <Dialog open={!!editTransaction} onOpenChange={() => setEditTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Ex: Supermercado"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-amount">Valor (R$)</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-category">Categoria</Label>
              <Select
                value={editForm.category_id}
                onValueChange={(value) => setEditForm({ ...editForm, category_id: value })}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => {
                    const CatIcon = getCategoryIcon(cat.icon_name || '');
                    return (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        <span className="flex items-center gap-2">
                          <CatIcon size={16} />
                          {cat.name}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-date">Data</Label>
              <Input
                id="edit-date"
                type="date"
                value={editForm.transaction_date}
                onChange={(e) => setEditForm({ ...editForm, transaction_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTransaction(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSubmit} disabled={updateTransactionMutation.isPending}>
              {updateTransactionMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Single Transaction Dialog */}
      <AlertDialog open={!!deleteTransactionId} onOpenChange={() => setDeleteTransactionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {selectedTransactions.length} Transações</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir as {selectedTransactions.length} transações selecionadas? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir Todas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryAnalysis;
