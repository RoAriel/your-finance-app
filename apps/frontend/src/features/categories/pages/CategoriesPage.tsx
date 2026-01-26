import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { CategoryCard } from '../components/CategoryCard';
import { CategoryModal } from '../components/CategoryModal';
import type { Category } from '../types';

export const CategoriesPage = () => {
  // 🔴 CAMBIO CLAVE AQUÍ:
  // 1. Recibimos 'rawData' (que puede ser cualquier cosa)
  const { data: rawData, isLoading } = useCategories();

  // 2. BLINDAJE: Extraemos el array real, venga como venga.
  // Si es array -> lo usamos.
  // Si es objeto con .data -> usamos .data.
  // Si falla -> array vacío.
  const categories = Array.isArray(rawData)
    ? rawData
    : (rawData as any)?.data || [];

  // Estados para el Modal y Edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Estado para el Buscador
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  // Filtrado simple en cliente
  // (Ahora 'categories' es 100% seguro un array, así que .filter no fallará)
  const filteredCategories = categories.filter((c: any) =>
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
            />
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              No se encontraron categorías que coincidan.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <CategoryModal
        // 🔥 El truco de la Key sigue aquí: limpia el modal al cerrarse/abrirse
        key={isModalOpen ? editingCategory?.id || 'new' : 'closed'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={editingCategory}
      />
    </div>
  );
};
