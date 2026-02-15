import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { Budget } from '../services/budgets.service';
import { useBudgets } from '../hooks/useBudgets';
import { useCategories } from '@/features/categories/hooks/useCategories'; // 👈 Importamos para buscar nombre
import { formatCurrency } from '@/utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  budgetToEdit?: Budget | null;
  initialCategoryId?: string; // 👈 PROP NUEVA: ID pre-seleccionado
  currentMonth: number;
  currentYear: number;
}

export const CreateBudgetModal = ({
  isOpen,
  onClose,
  budgetToEdit,
  initialCategoryId,
  currentMonth,
  currentYear,
}: Props) => {
  const { createBudget, updateBudget, isCreating, isUpdating } = useBudgets(
    currentMonth,
    currentYear
  );

  // Traemos categorías para buscar el nombre si es un presupuesto nuevo
  const { categories } = useCategories();

  // 1. Identificamos el ID y Nombre de la categoría objetivo
  const targetCategoryId = budgetToEdit?.categoryId || initialCategoryId;

  const targetCategoryName =
    budgetToEdit?.categoryName ||
    categories.find((c) => c.id === targetCategoryId)?.name ||
    'Categoría';

  const spentAmount = budgetToEdit?.spent || 0;

  // 2. Estado del monto
  const [amount, setAmount] = useState(() => {
    if (budgetToEdit && budgetToEdit.amount > 0) {
      return budgetToEdit.amount.toString();
    }
    return '';
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalAmount = parseFloat(amount);
    if (isNaN(finalAmount) || finalAmount < 0) return;

    if (!targetCategoryId) return;

    try {
      if (budgetToEdit?.id) {
        // A. MODO EDICIÓN (Actualizar monto)
        await updateBudget(budgetToEdit.id, { amount: finalAmount });
      } else {
        // B. MODO CREACIÓN (Crear nuevo)
        await createBudget({
          categoryId: targetCategoryId,
          amount: finalAmount,
          month: currentMonth,
          year: currentYear,
        });
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  // Validación de apertura: Debe estar abierto y tener al menos un ID de categoría destino
  if (!isOpen || (!budgetToEdit && !initialCategoryId)) return null;

  const isLoading = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-800">
              {budgetToEdit ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              Para:{' '}
              <span className="font-medium text-primary">
                {targetCategoryName}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Límite Mensual
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-7 pr-4 py-3 text-lg font-semibold text-gray-800 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            {/* Mostrar gasto actual (si existe) para referencia */}
            {spentAmount > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Ya has gastado{' '}
                <span className="text-red-500 font-medium">
                  {formatCurrency(spentAmount)}
                </span>{' '}
                en esta categoría este mes.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !amount}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} />
                Guardar Presupuesto
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
