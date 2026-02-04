import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';
import { BudgetCard } from '../components/BudgetCard';
import { CreateBudgetModal } from '../components/CreateBudgetModal';
import type { Budget } from '../services/budgets.service';
import { useConfirm } from '../../../context/ConfirmContext';

// 👇 IMPORTAMOS EL COMPONENTE REUTILIZABLE (Ajusta la ruta si lo moviste a common)
import { MonthSelector } from '../../../components/common/MonthSelector';

export const BudgetsPage = () => {
  // 1. Estados para Fecha (Mantenemos la lógica numérica para el hook)
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // 2. Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // 3. Hooks y Datos
  const { budgets, isLoading, deleteBudget, refetch } = useBudgets(
    selectedMonth,
    selectedYear
  );
  const { confirm } = useConfirm();

  // --- HANDLERS ---

  // 👇 ADAPTADOR: El componente nos da un Date, nosotros extraemos mes/año
  const handleDateChange = (newDate: Date) => {
    setSelectedMonth(newDate.getMonth() + 1);
    setSelectedYear(newDate.getFullYear());
  };

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: '¿Eliminar Presupuesto?',
      message:
        'Esta acción eliminará el límite de gasto para esta categoría en este mes.',
      variant: 'danger',
      onConfirm: async () => {
        await deleteBudget(id);
      },
    });
  };

  // 👇 Construimos el objeto Date para pasarle al componente
  // (Restamos 1 al mes porque Date usa 0-11 y nosotros 1-12)
  const currentDateObj = new Date(selectedYear, selectedMonth - 1, 1);

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header con Selectores */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Presupuestos</h1>
          <p className="text-gray-500">Controla tus límites de gasto mensual</p>
        </div>

        {/* 🛠️ BARRA DE NAVEGACIÓN REUTILIZADA */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* 👇 AQUÍ ESTÁ EL CAMBIO: Reutilización total */}
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

      {/* Grid de Presupuestos */}
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-20">
          {budgets?.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

          {(!budgets || budgets.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <p>No tienes presupuestos definidos para esta fecha.</p>
              <button
                onClick={handleOpenCreate}
                className="text-primary font-medium hover:underline mt-2"
              >
                Crear el primero
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <CreateBudgetModal
          key={editingBudget ? editingBudget.id : 'new-budget'}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          budgetToEdit={editingBudget}
          initialMonth={selectedMonth}
          initialYear={selectedYear}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
};
