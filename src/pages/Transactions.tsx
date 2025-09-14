import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Search, Pencil, Trash2, Plus, Minus, Calendar, CalendarIcon } from 'lucide-react';
import { useRecentTransactions, useCategories, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const Transactions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [transactionType, setTransactionType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Edit modal states
  const [editTransaction, setEditTransaction] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    category_id: '',
    transaction_date: ''
  });
  
  // Delete confirmation states
  const [deleteTransactionId, setDeleteTransactionId] = useState<number | null>(null);

  const { data: transactions = [], isLoading } = useRecentTransactions(100);
  const { data: categories = [] } = useCategories();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCategoryType = (categoryId: number | null) => {
    if (!categoryId) return null;
    const category = categories.find(c => c.id === categoryId);
    return (category as any)?.tipo || null;
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      const selectedMonth = selectedDate.getMonth();
      const selectedYear = selectedDate.getFullYear();
      
      const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true;
      
      // Improved category matching - include subcategories when parent is selected
      let matchesCategory = true;
      if (selectedCategory !== 'all') {
        const selectedCategoryObj = categories?.find(cat => cat.id.toString() === selectedCategory);
        if (selectedCategoryObj) {
          if (selectedCategoryObj.parent_category_id === null) {
            // Parent category selected - include all subcategories
            const subcategoryIds = categories?.filter(cat => 
              cat.parent_category_id === selectedCategoryObj.id
            ).map(cat => cat.id) || [];
            
            matchesCategory = transaction.category_id === selectedCategoryObj.id || 
                            subcategoryIds.includes(transaction.category_id);
          } else {
            // Subcategory selected - exact match
            matchesCategory = transaction.category_id === selectedCategoryObj.id;
          }
        } else {
          matchesCategory = false;
        }
      }
      
      // Fix income/expense filter to use category type
      let matchesType = true;
      if (transactionType === 'income') {
        const categoryType = getCategoryType(transaction.category_id);
        matchesType = categoryType === 'Entrada';
      } else if (transactionType === 'expense') {
        const categoryType = getCategoryType(transaction.category_id);
        matchesType = categoryType === 'Saída';
      }
      
      const matchesMonth = transactionDate.getMonth() === selectedMonth && transactionDate.getFullYear() === selectedYear;

      return matchesSearch && matchesCategory && matchesType && matchesMonth;
    });
  }, [transactions, searchTerm, selectedCategory, transactionType, selectedDate, categories]);

  const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalIncome = filteredTransactions.filter(t => getCategoryType(t.category_id) === 'Entrada').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => getCategoryType(t.category_id) === 'Saída').reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria desconhecida';
  };

  const getCategoryIcon = (categoryId: number | null) => {
    if (!categoryId) return '📦';
    const category = categories.find(c => c.id === categoryId);
    return category?.icon_name || '📦';
  };

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
    
    const categoryType = getCategoryType(parseInt(editForm.category_id));
    const amount = parseFloat(editForm.amount);
    const finalAmount = categoryType === 'Saída' ? -Math.abs(amount) : Math.abs(amount);
    
    await updateTransactionMutation.mutateAsync({
      transactionId: editTransaction.id,
      transactionData: {
        description: editForm.description,
        amount: finalAmount,
        category_id: parseInt(editForm.category_id),
        transaction_date: editForm.transaction_date
      }
    });
    
    setEditTransaction(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTransactionId) return;
    
    await deleteTransactionMutation.mutateAsync(deleteTransactionId);
    setDeleteTransactionId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse p-4 sm:p-6 space-y-4">
          <div className="h-6 bg-muted rounded w-48"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-6">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </button>
            <h1 className="text-lg sm:text-2xl font-bold text-display">
              Todas as Transações
            </h1>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <Card className="p-3 bg-card">
              <div className="text-xs sm:text-sm text-muted-foreground">Total</div>
              <div className={`text-sm sm:text-lg font-bold ${totalAmount >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {formatCurrency(totalAmount)}
              </div>
            </Card>
            <Card className="p-3 bg-card">
              <div className="text-xs sm:text-sm text-muted-foreground">Entradas</div>
              <div className="text-sm sm:text-lg font-bold text-primary">
                {formatCurrency(totalIncome)}
              </div>
            </Card>
            <Card className="p-3 bg-card">
              <div className="text-xs sm:text-sm text-muted-foreground">Saídas</div>
              <div className="text-sm sm:text-lg font-bold text-destructive">
                {formatCurrency(totalExpenses)}
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            {/* Filter Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-9 text-xs justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {format(selectedDate, "MMM yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories
                    .filter(category => !category.parent_category_id) // Only parent categories
                    .map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Entradas</SelectItem>
                  <SelectItem value="expense">Saídas</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setTransactionType('all');
                }}
                className="h-9 text-xs"
              >
                <Filter size={14} className="mr-1" />
                Limpar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="p-4 sm:p-6 pt-0">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">Nenhuma transação encontrada</div>
            <div className="text-sm text-muted-foreground">
              Ajuste os filtros ou adicione novas transações
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((transaction) => {
              const categoryType = getCategoryType(transaction.category_id);
              const isIncome = categoryType === 'Entrada';
              
              return (
                <Card key={transaction.id} className="p-3 sm:p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="text-lg flex-shrink-0">
                        {getCategoryIcon(transaction.category_id)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground text-sm sm:text-base truncate">
                            {transaction.description || 'Transação sem descrição'}
                          </p>
                          {isIncome ? (
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                              <Plus size={10} className="mr-1" />
                              Entrada
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                              <Minus size={10} className="mr-1" />
                              Saída
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span>{getCategoryName(transaction.category_id)}</span>
                          <span>•</span>
                          <span>{formatDate(transaction.transaction_date)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className={`font-bold text-sm sm:text-base ${
                          isIncome ? 'text-primary' : 'text-destructive'
                        }`}>
                          {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                        </p>
                      </div>
                      
                      <div className="flex gap-1 ml-2">
                        <button 
                          className="p-1 sm:p-1.5 rounded-md hover:bg-muted transition-colors"
                          onClick={() => handleEditClick(transaction)}
                        >
                          <Pencil size={14} className="text-muted-foreground hover:text-foreground" />
                        </button>
                        <button 
                          className="p-1 sm:p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                          onClick={() => setDeleteTransactionId(transaction.id)}
                        >
                          <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      <Dialog open={!!editTransaction} onOpenChange={() => setEditTransaction(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Descrição</Label>
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Descrição da transação"
              />
            </div>
            
            <div>
              <Label>Valor</Label>
              <Input
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                placeholder="0,00"
                step="0.01"
              />
            </div>
            
            <div>
              <Label>Categoria</Label>
              <Select value={editForm.category_id} onValueChange={(value) => setEditForm({ ...editForm, category_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.icon_name} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Data</Label>
              <Input
                type="date"
                value={editForm.transaction_date}
                onChange={(e) => setEditForm({ ...editForm, transaction_date: e.target.value })}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditTransaction(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEditSubmit}
                disabled={updateTransactionMutation.isPending}
                className="flex-1"
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
              disabled={deleteTransactionMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Transactions;