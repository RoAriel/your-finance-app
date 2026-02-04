import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';
import type { Budget } from '../services/budgets.service';
// 👇 1. Importamos tu nuevo componente reutilizable
import { CategorySelector } from '../../../components/common/CategorySelector';
import { CategoryType } from '../../categories/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  budgetToEdit: Budget | null;
  initialMonth: number;
  initialYear: number;
  onSuccess: () => void;
}

export const CreateBudgetModal = ({
  isOpen,
  onClose,
  budgetToEdit,
  initialMonth,
  initialYear,
  onSuccess,
}: Props) => {
  const { createBudget, updateBudget, isLoading } = useBudgets(
    initialMonth,
    initialYear
  );

  // Estados del formulario
  // Inicializamos amount con el valor si editamos, o vacío
  const [amount, setAmount] = useState(
    budgetToEdit ? budgetToEdit.amount.toString() : ''
  );

  const [categoryId, setCategoryId] = useState(
    budgetToEdit ? budgetToEdit.categoryId : ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (budgetToEdit) {
        // Al editar, solo mandamos el monto nuevo
        await updateBudget(budgetToEdit.id, {
          amount: parseFloat(amount),
        });
      } else {
        // Al crear, mandamos todo
        await createBudget({
          amount: parseFloat(amount),
          categoryId: categoryId,
          month: initialMonth,
          year: initialYear,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {budgetToEdit ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 2. Categoría (Solo visible al crear) USANDO EL SELECTOR */}
          {!budgetToEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <CategorySelector
                value={categoryId}
                onChange={setCategoryId}
                type={CategoryType.EXPENSE}
                placeholder="Categoría a presupuestar..."
              />
            </div>
          )}

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Límite Mensual
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                $
              </span>
              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pl-8 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Info de fecha */}
          <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
            Este presupuesto aplicará para:{' '}
            <strong>
              {initialMonth}/{initialYear}
            </strong>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              // 3. Validación extra: Desactivar si no hay categoría seleccionada (al crear)
              disabled={isLoading || (!budgetToEdit && !categoryId)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
