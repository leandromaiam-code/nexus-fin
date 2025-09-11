import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Save,
  X
} from 'lucide-react';
import { useCategories } from '@/hooks/useSupabaseData';
import { NexusButton } from '@/components/ui/nexus-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ManageCategories = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useCategories();
  
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon_name: '',
    parent_category_id: null as number | null
  });

  // Get root categories (no parent)
  const rootCategories = categories?.filter(cat => !cat.parent_category_id) || [];
  
  // Get subcategories for a parent category
  const getSubcategories = (parentId: number) => {
    return categories?.filter(cat => cat.parent_category_id === parentId) || [];
  };

  // Check if user can edit this category (user-created categories only)
  const canEditCategory = (category: any) => {
    return category.user_id !== null;
  };

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const openCreateModal = (parentId: number | null = null) => {
    setModalMode('create');
    setSelectedParentId(parentId);
    setFormData({
      name: '',
      description: '',
      icon_name: '',
      parent_category_id: parentId
    });
    setIsModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setModalMode('edit');
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon_name: category.icon_name || '',
      parent_category_id: category.parent_category_id
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setSelectedParentId(null);
    setFormData({
      name: '',
      description: '',
      icon_name: '',
      parent_category_id: null
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'create') {
        // TODO: Integrate with n8n webhook
        const payload = {
          action_type: "CREATE_CATEGORY",
          payload: {
            name: formData.name,
            description: formData.description,
            icon_name: formData.icon_name,
            parent_category_id: formData.parent_category_id
          }
        };
        console.log("Creating category:", payload);
        
        // Mock success response
        alert("Categoria criada com sucesso!");
      } else {
        // TODO: Integrate with n8n webhook
        const payload = {
          action_type: "UPDATE_CATEGORY",
          payload: {
            category_id: editingCategory.id,
            name: formData.name,
            description: formData.description,
            icon_name: formData.icon_name
          }
        };
        console.log("Updating category:", payload);
        
        // Mock success response
        alert("Categoria atualizada com sucesso!");
      }
      
      closeModal();
    } catch (error) {
      console.error("Error submitting category:", error);
      alert("Erro ao salvar categoria. Tente novamente.");
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      // TODO: Integrate with n8n webhook
      const payload = {
        action_type: "DELETE_CATEGORY",
        payload: {
          category_id: categoryId
        }
      };
      console.log("Deleting category:", payload);
      
      // Mock success response
      alert("Categoria excluída com sucesso!");
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Erro ao excluir categoria. Tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="p-6">
          <div className="flex items-center mb-4">
            <Skeleton className="w-6 h-6 mr-4" />
            <Skeleton className="w-48 h-8" />
          </div>
        </header>
        <div className="px-6 space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="w-full h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 rounded-lg hover:bg-muted transition-colors mr-2"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-display">Gerenciar Categorias</h1>
              <p className="text-muted-foreground">Personalize seu plano de contas</p>
            </div>
          </div>
          
          <NexusButton onClick={() => openCreateModal()} size="sm">
            <Plus size={16} className="mr-2" />
            Nova
          </NexusButton>
        </div>
      </header>

      <div className="px-6 space-y-4">
        {/* Categories List */}
        {rootCategories.map((category) => {
          const subcategories = getSubcategories(category.id);
          const isExpanded = expandedCategories.has(category.id);
          const hasSubcategories = subcategories.length > 0;

          return (
            <div key={category.id} className="card-nexus">
              {/* Parent Category */}
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  {hasSubcategories && (
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="p-1 rounded hover:bg-muted transition-colors mr-2"
                    >
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-muted-foreground" />
                      ) : (
                        <ChevronRight size={16} className="text-muted-foreground" />
                      )}
                    </button>
                  )}
                  
                  <div className="flex items-center flex-1">
                    {category.icon_name && (
                      <span className="text-lg mr-3">{category.icon_name}</span>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      )}
                      {!canEditCategory(category) && (
                        <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                          Sistema
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {hasSubcategories && (
                    <NexusButton
                      variant="ghost"
                      size="sm"
                      onClick={() => openCreateModal(category.id)}
                    >
                      <Plus size={14} className="mr-1" />
                      Sub
                    </NexusButton>
                  )}

                  {canEditCategory(category) && (
                    <>
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Edit3 size={16} className="text-muted-foreground hover:text-primary" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Trash2 size={16} className="text-muted-foreground hover:text-destructive" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Subcategories */}
              {isExpanded && hasSubcategories && (
                <div className="mt-4 pl-6 space-y-2 border-l-2 border-muted">
                  {subcategories.map((subcat) => (
                    <div key={subcat.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center flex-1">
                        {subcat.icon_name && (
                          <span className="text-sm mr-2">{subcat.icon_name}</span>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-foreground">{subcat.name}</h4>
                          {subcat.description && (
                            <p className="text-xs text-muted-foreground">{subcat.description}</p>
                          )}
                          {!canEditCategory(subcat) && (
                            <span className="text-xs text-primary bg-primary/10 px-1 py-0.5 rounded">
                              Sistema
                            </span>
                          )}
                        </div>
                      </div>

                      {canEditCategory(subcat) && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => openEditModal(subcat)}
                            className="p-1 rounded hover:bg-muted transition-colors"
                          >
                            <Edit3 size={14} className="text-muted-foreground hover:text-primary" />
                          </button>
                          <button
                            onClick={() => handleDelete(subcat.id)}
                            className="p-1 rounded hover:bg-muted transition-colors"
                          >
                            <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Create Root Category Button */}
        <button
          onClick={() => openCreateModal()}
          className="w-full p-4 border-2 border-dashed border-muted rounded-xl hover:border-primary hover:bg-primary/5 transition-colors group"
        >
          <div className="flex items-center justify-center text-muted-foreground group-hover:text-primary">
            <Plus size={20} className="mr-2" />
            <span>Adicionar Nova Categoria Principal</span>
          </div>
        </button>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create' ? 'Nova Categoria' : 'Editar Categoria'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Categoria</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Entretenimento"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Gastos com lazer e diversão"
              />
            </div>

            <div>
              <Label htmlFor="icon">Ícone (Opcional)</Label>
              <Input
                id="icon"
                value={formData.icon_name}
                onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                placeholder="Ex: 🎬"
                maxLength={2}
              />
            </div>

            {selectedParentId && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary">
                  Esta será uma subcategoria de: {rootCategories.find(c => c.id === selectedParentId)?.name}
                </p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <NexusButton type="submit" className="flex-1">
                <Save size={16} className="mr-2" />
                {modalMode === 'create' ? 'Criar' : 'Salvar'}
              </NexusButton>
              <NexusButton type="button" variant="outline" onClick={closeModal}>
                <X size={16} className="mr-2" />
                Cancelar
              </NexusButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageCategories;