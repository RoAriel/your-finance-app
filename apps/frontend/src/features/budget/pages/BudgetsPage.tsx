import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';
import { BudgetCard } from '../components/BudgetCard';
import { CreateBudgetModal } from '../components/CreateBudgetModal';
import type { Budget } from '../services/budgets.service';
import { useConfirm } from '@/context/ConfirmContext';
import { MonthSelector } from '@/components/common/MonthSelector';

// 👇 HELPER RECURSIVO: Determina si un presupuesto (o sus hijos) es relevante
const hasActivity = (budget: Budget): boolean => {
  // 1. Si el propio nodo tiene dinero asignado o gastado, es relevante.
  if (budget.amount > 0 || budget.spent > 0) return true;

  // 2. Si tiene hijos, verificamos si ALGUNO de ellos es relevante.
  if (budget.children && budget.children.length > 0) {
    return budget.children.some((child) => hasActivity(child));
  }

  return false;
};

export const BudgetsPage = () => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [showAll, setShowAll] = useState(false); // Toggle para ver vacíos

  const { budgets, isLoading, deleteBudget } = useBudgets(
    selectedMonth,
    selectedYear
  );
  const { confirm } = useConfirm();

  // 👇 FILTRADO INTELIGENTE
  const activeBudgets = (budgets || []).filter(
    (b) => showAll || hasActivity(b)
  );

  // --- HANDLERS ---
  const handleDateChange = (newDate: Date) => {
    setSelectedMonth(newDate.getMonth() + 1);
    setSelectedYear(newDate.getFullYear());
  };

  const handleOpenCreate = () => {
    setShowAll(true); // Al crear, mostramos todo para que el usuario elija
    setEditingBudget(null);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
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
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Presupuestos</h1>
          <p className="text-gray-500">Controla tus límites de gasto mensual</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Toggle Ver Todo */}
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
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-hover transition-colors font-medium shadow-sm whitespace-nowrap"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nuevo</span>
            <span className="sm:hidden">Crear</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-20">
          {activeBudgets.map((budget) => (
            <BudgetCard
              key={budget.categoryId} // ✅ Key correcta
              budget={budget}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

          {activeBudgets.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <p>No tienes presupuestos activos para esta fecha.</p>
              <button
                onClick={() => setShowAll(true)}
                className="text-primary font-medium hover:underline mt-2"
              >
                Ver categorías disponibles
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <CreateBudgetModal
          key={editingBudget ? editingBudget.categoryId : 'new-budget-modal'}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          budgetToEdit={editingBudget}
          currentMonth={selectedMonth}
          currentYear={selectedYear}
        />
      )}
    </div>
  );
};
