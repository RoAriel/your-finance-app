import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useCategories } from '../hooks/useCategories'; // 👈 FIX: Solo importamos el hook unificado
import { CategoryCard } from '../components/CategoryCard';
import { CategoryModal } from '../components/CategoryModal';
import { CategoryType } from '../types';
import type { Category } from '../types';
import { useConfirm } from '@/context/ConfirmContext';

export const CategoriesPage = () => {
  // 👇 FIX: Extraemos deleteCategory del hook unificado
  const { categories: rawData, isLoading, deleteCategory } = useCategories();

  const { confirm } = useConfirm();

  // Estados UI
  const [filterType, setFilterType] = useState<CategoryType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // --- LÓGICA DE FILTRADO ---
  const filteredCategories = (rawData || []).filter((cat) => {
    // 1. Filtro por Tipo (Desplegable)
    const matchesType =
      filterType === 'ALL' ||
      cat.type === filterType ||
      cat.type === CategoryType.BOTH;

    // 2. Filtro por Buscador
    const matchesSearch = cat.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesType && matchesSearch;
  });

  // Función auxiliar para obtener el nombre del padre
  const getParentName = (parentId: string | null) => {
    if (!parentId) return null;
    const parent = rawData?.find((c) => c.id === parentId);
    return parent ? parent.name : null;
  };

  // --- HANDLERS ---
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    // Verificar si es padre de alguien
    const hasChildren = rawData?.some((c) => c.parentId === id);

    if (hasChildren) {
      confirm({
        title: 'No se puede eliminar',
        message:
          'Esta categoría tiene subcategorías. Elimínalas o muévelas primero.',
        variant: 'info',
        confirmText: 'Entendido',
        onConfirm: () => {},
      });
      return;
    }

    confirm({
      title: '¿Eliminar Categoría?',
      message: 'Esta acción no se puede deshacer.',
      confirmText: 'Sí, eliminar',
      variant: 'danger',
      onConfirm: async () => {
        // 👇 FIX: Llamada directa a la función del hook
        await deleteCategory(id);
      },
    });
  };

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
          <p className="text-gray-500">
            Administra tus grupos de gastos e ingresos
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-sm"
        >
          <Plus size={20} />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Barra de Herramientas (Buscador + Filtro) */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>

        {/* Filtro Desplegable */}
        <div className="relative min-w-[200px]">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as CategoryType | 'ALL')
            }
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white appearance-none cursor-pointer text-gray-700"
          >
            <option value="ALL">Todas las Categorías</option>
            <option value={CategoryType.EXPENSE}>Solo Gastos</option>
            <option value={CategoryType.INCOME}>Solo Ingresos</option>
          </select>
        </div>
      </div>

      {/* Grid de Tarjetas */}
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-20">
          {filteredCategories.map((category) => {
            const parentName = getParentName(category.parentId);

            return (
              <CategoryCard
                key={category.id}
                category={category}
                parentName={parentName}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
              <p>No se encontraron categorías.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          categoryToEdit={editingCategory}
        />
      )}
    </div>
  );
};
