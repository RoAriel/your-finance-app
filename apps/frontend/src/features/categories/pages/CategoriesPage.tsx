import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { CategoryCard } from '../components/CategoryCard';
import { CategoryModal } from '../components/CategoryModal';
import type { Category } from '../types';
import type { PaginatedResponse } from '../../../types';
import { useConfirm } from '../../../context/ConfirmContext';

export const CategoriesPage = () => {
  const { data: rawData, isLoading, deleteCategory } = useCategories();
  const { confirm } = useConfirm(); // Hook del Modal Global

  // Lógica segura para leer datos (Array o Objeto paginado)
  const categories = Array.isArray(rawData)
    ? (rawData as Category[])
    : (rawData as unknown as PaginatedResponse<Category>)?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // ✅ NUEVA LÓGICA DE ELIMINAR (Usando el Hook Global)
  const handleDelete = (id: string) => {
    confirm({
      title: '¿Eliminar Categoría?',
      message:
        'Esta acción no se puede deshacer. Podrías perder la referencia en tus transacciones históricas.',
      confirmText: 'Sí, eliminar',
      variant: 'danger',
      onConfirm: async () => {
        // Al ser asíncrono, el modal mostrará el spinner automáticamente
        await deleteCategory(id);
      },
    });
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
          <p className="text-gray-500">Personaliza cómo organizas tu dinero</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-sm cursor-pointer"
        >
          <Plus size={20} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
        />
      </div>

      {/* Grid de Cards */}
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-20">
          {filteredCategories.map((category: Category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              No se encontraron categorías que coincidan.
            </div>
          )}
        </div>
      )}

      {/* Modal de Creación/Edición */}
      <CategoryModal
        key={isModalOpen ? editingCategory?.id || 'new' : 'closed'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={editingCategory}
      />
    </div>
  );
};
