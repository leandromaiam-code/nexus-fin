import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Search, Pencil, Trash2, Plus, Minus, Calendar } from 'lucide-react';
import { useRecentTransactions, useCategories } from '@/hooks/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Transactions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [transactionType, setTransactionType] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: transactions = [], isLoading } = useRecentTransactions(100); // Get more transactions
  const { data: categories = [] } = useCategories();

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

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      const transactionMonth = transactionDate.toISOString().slice(0, 7);
      
      const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true;
      const matchesCategory = selectedCategory === 'all' || transaction.category_id?.toString() === selectedCategory;
      const matchesType = transactionType === 'all' || 
        (transactionType === 'income' && transaction.amount > 0) ||
        (transactionType === 'expense' && transaction.amount < 0);
      const matchesMonth = transactionMonth === selectedMonth;

      return matchesSearch && matchesCategory && matchesType && matchesMonth;
    });
  }, [transactions, searchTerm, selectedCategory, transactionType, selectedMonth]);

  const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalIncome = filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

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
              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-muted-foreground" />
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.icon_name} {category.name}
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
            {filteredTransactions.map((transaction) => (
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
                        {transaction.amount > 0 ? (
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
                        transaction.amount >= 0 ? 'text-primary' : 'text-destructive'
                      }`}>
                        {transaction.amount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </p>
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      <button 
                        className="p-1 sm:p-1.5 rounded-md hover:bg-muted transition-colors"
                        onClick={() => {/* TODO: Implementar edição */}}
                      >
                        <Pencil size={14} className="text-muted-foreground hover:text-foreground" />
                      </button>
                      <button 
                        className="p-1 sm:p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                        onClick={() => {/* TODO: Implementar exclusão */}}
                      >
                        <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;