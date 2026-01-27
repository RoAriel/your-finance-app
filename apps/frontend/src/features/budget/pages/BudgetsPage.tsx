import { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';
import { BudgetCard } from '../components/BudgetCard';
import { CreateBudgetModal } from '../components/CreateBudgetModal';
import type { Budget } from '../services/budgets.service';
import { useConfirm } from '../../../context/ConfirmContext';
// 👇 Importamos tu componente reutilizable
import { MonthSelector } from '../../dashboard/components/MonthSelector';

export const BudgetsPage = () => {
  // 2. Modal de Confirmación Global
  const { confirm } = useConfirm();

  // 3. Estados para modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // --- LÓGICA DE FECHAS ---

  const [currentDate, setCurrentDate] = useState(new Date());
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const { budgets, isLoading, deleteBudget, refetch } = useBudgets(month, year);

  // --- HANDLERS ---

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: '¿Eliminar Presupuesto?',
      message:
        'Si eliminas este presupuesto, perderás el seguimiento de gastos para esta categoría en este mes.',
      confirmText: 'Sí, eliminar',
      variant: 'danger',
      onConfirm: async () => {
        await deleteBudget(id);
      },
    });
  };

  // --- RENDER ---

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header y Controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Presupuestos</h1>
          <p className="text-gray-500">
            Planifica tus límites y controla tus gastos
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* 👇 Selector de Mes Reutilizable */}
          <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-sm ml-auto sm:ml-0"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>
      </div>

      {/* Grid de Presupuestos */}
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {budgets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-12">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <Wallet size={32} className="text-gray-300" />
              </div>
              <p className="font-medium">No hay presupuestos para este mes.</p>
              <p className="text-sm">¡Define un límite para comenzar!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-20">
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal para Crear/Editar */}
      <CreateBudgetModal
        key={isModalOpen ? editingBudget?.id || 'new' : 'closed'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        budgetToEdit={editingBudget}
        // 👇 AGREGAMOS ESTOS DOS
        initialMonth={currentDate.getMonth() + 1}
        initialYear={currentDate.getFullYear()}
        onSuccess={() => {
          refetch(); // Recarga la lista de la página
        }}
      />
    </div>
  );
};
