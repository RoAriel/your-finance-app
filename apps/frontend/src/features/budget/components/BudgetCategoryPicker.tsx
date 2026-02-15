import { X, Search } from 'lucide-react';
import { useState } from 'react';
import type { Category } from '@/features/categories/types';
import { iconMap } from '@/components/common/icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  usedCategoryIds: string[]; // IDs que YA tienen presupuesto
  onSelect: (category: Category) => void;
}

export const BudgetCategoryPicker = ({
  isOpen,
  onClose,
  categories,
  usedCategoryIds,
  onSelect,
}: Props) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // 1. Filtramos: Que no esté usada Y que coincida con la búsqueda
  // También filtramos las categorías de tipo INGRESO si no las presupuestas
  const availableCategories = categories.filter((cat) => {
    const isUsed = usedCategoryIds.includes(cat.id);
    const matchesSearch = cat.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const isExpense = cat.type === 'EXPENSE'; // Asumimos que solo presupuestas gastos
    return !isUsed && matchesSearch && isExpense;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">
            Selecciona una Categoría
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Buscador */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Grid de Opciones */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {availableCategories.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              <p>
                No hay categorías disponibles o todas ya tienen presupuesto.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableCategories.map((cat) => {
                const Icon = iconMap[cat.icon] || iconMap['Wallet'];
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelect(cat)}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-primary/50 hover:bg-primary/5 transition-all group text-center h-28"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: cat.color }}
                    >
                      <Icon size={18} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-primary leading-tight">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
