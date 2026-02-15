import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { BudgetRow } from '../components/BudgetRow';
import { CreateBudgetModal } from '../components/CreateBudgetModal';
import { BudgetCategoryPicker } from '../components/BudgetCategoryPicker';
import type { Budget } from '../services/budgets.service';
import { useConfirm } from '@/context/ConfirmContext';
import { MonthSelector } from '@/components/common/MonthSelector';
import type { Category } from '@/features/categories/types';

// Helper recursivo para actividad visual (se mantiene igual)
const hasActivity = (budget: Budget): boolean => {
  if (budget.amount > 0 || budget.spent > 0) return true;
  if (budget.children && budget.children.length > 0) {
    return budget.children.some((child) => hasActivity(child));
  }
  return false;
};

// 👇 NUEVO HELPER 1: Solo obtiene IDs que tengan un LÍMITE REAL definido (> 0)
// Esto permite que el Picker muestre las categorías con presupuesto 0 (virtuales)
const getIdsWithActiveLimit = (budgets: Budget[]): string[] => {
  let ids: string[] = [];
  budgets.forEach((b) => {
    // Solo consideramos "Usada" si tiene un límite definido
    if (b.amount > 0) {
      ids.push(b.categoryId);
    }
    if (b.children) {
      ids = [...ids, ...getIdsWithActiveLimit(b.children)];
    }
  });
  return ids;
};

// 👇 NUEVO HELPER 2: Busca un presupuesto (incluso virtual) por ID de Categoría
const findBudgetByCategoryId = (
  budgets: Budget[],
  catId: string
): Budget | null => {
  for (const b of budgets) {
    if (b.categoryId === catId) return b;
    if (b.children) {
      const found = findBudgetByCategoryId(b.children, catId);
      if (found) return found;
    }
  }
  return null;
};

export const BudgetsPage = () => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedCategoryForNewBudget, setSelectedCategoryForNewBudget] =
    useState<Category | null>(null);

  const [showAll, setShowAll] = useState(false);

  const { budgets, isLoading, deleteBudget } = useBudgets(
    selectedMonth,
    selectedYear
  );
  const { categories } = useCategories();
  const { confirm } = useConfirm();

  const activeBudgets = (budgets || []).filter((b) => {
    if (b.categoryName === 'Ingresos') return false;
    return showAll || hasActivity(b);
  });

  // ✅ CORRECCIÓN 1: 'usedCategoryIds' ahora solo incluye los que tienen amount > 0
  const usedCategoryIds = useMemo(
    () => getIdsWithActiveLimit(budgets || []),
    [budgets]
  );

  const handleDateChange = (newDate: Date) => {
    setSelectedMonth(newDate.getMonth() + 1);
    setSelectedYear(newDate.getFullYear());
  };

  const handleOpenPicker = () => {
    setIsPickerOpen(true);
  };

  // ✅ CORRECCIÓN 2: Lógica inteligente al seleccionar
  const handleCategorySelect = (category: Category) => {
    setIsPickerOpen(false);

    // Buscamos si ya existe un presupuesto (aunque sea virtual/cero) para esta categoría
    const existingBudget = findBudgetByCategoryId(budgets || [], category.id);

    if (existingBudget) {
      // SI EXISTE (Virtual): Abrimos en modo EDICIÓN para actualizarlo
      setEditingBudget(existingBudget);
      setSelectedCategoryForNewBudget(null);
    } else {
      // NO EXISTE: Abrimos en modo CREACIÓN
      setEditingBudget(null);
      setSelectedCategoryForNewBudget(category);
    }

    setIsCreateModalOpen(true);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setSelectedCategoryForNewBudget(null);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: '¿Eliminar Presupuesto?',
      message: 'Esta acción eliminará el límite de gasto para esta categoría.',
      variant: 'danger',
      onConfirm: async () => {
        await deleteBudget(id);
      },
    });
  };

  const currentDateObj = new Date(selectedYear, selectedMonth - 1, 1);

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Presupuestos</h1>
          <p className="text-gray-500">Controla tus límites de gasto mensual</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium text-gray-500 hover:text-primary transition-colors px-2 whitespace-nowrap"
          >
            {showAll ? 'Ocultar vacíos' : 'Ver todos'}
          </button>

          <MonthSelector
            currentDate={currentDateObj}
            onChange={handleDateChange}
          />

          <button
            onClick={handleOpenPicker}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-hover transition-colors font-medium shadow-sm whitespace-nowrap"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nuevo</span>
            <span className="sm:hidden">Crear</span>
          </button>
        </div>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
            <div className="col-span-5 pl-12">Categoría</div>
            <div className="col-span-7">Progreso / Gastado vs Límite</div>
          </div>

          <div className="divide-y divide-gray-100 overflow-y-auto custom-scrollbar">
            {activeBudgets.map((budget) => (
              <BudgetRow
                key={budget.categoryId}
                budget={budget}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}

            {activeBudgets.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50/30">
                <p>No tienes presupuestos activos para este mes.</p>
                <button
                  onClick={handleOpenPicker}
                  className="text-primary font-medium hover:underline mt-2"
                >
                  Crear primer presupuesto
                </button>
              </div>
            )}
            <div className="h-20 md:hidden"></div>
          </div>
        </div>
      )}

      {/* Picker Modal */}
      <BudgetCategoryPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        categories={categories}
        usedCategoryIds={usedCategoryIds}
        onSelect={handleCategorySelect}
      />

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <CreateBudgetModal
          key={
            editingBudget
              ? editingBudget.categoryId
              : selectedCategoryForNewBudget?.id || 'new'
          }
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          budgetToEdit={editingBudget}
          initialCategoryId={selectedCategoryForNewBudget?.id}
          currentMonth={selectedMonth}
          currentYear={selectedYear}
        />
      )}
    </div>
  );
};
