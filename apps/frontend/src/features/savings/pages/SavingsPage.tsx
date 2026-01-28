import { useState } from 'react';
import { Plus, ArrowRightLeft } from 'lucide-react';
import { useSavings } from '../hooks/useSavings';
import { SavingsGoalCard } from '../components/SavingsGoalCard';
import { CreateEditSavingsModal } from '../components/CreateEditSavingsModal.tsx';
import { DepositModal } from '../components/DepositModal';
import { TransferModal } from '../components/TransferModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal'; // Reutilizamos tu modal común
import type { SavingsGoal } from '../types';

export const SavingsPage = () => {
  const { goals, isLoading, deleteGoal } = useSavings();

  // Estados para controlar los modales
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // 👇 Estados actualizados
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // 👇 Handlers para abrir el modal correcto
  const handleOpenCreate = () => {
    setEditingGoal(null); // Limpiamos para crear
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal); // Cargamos datos para editar
    setIsModalOpen(true);
  };

  // Estado para depósito
  const [depositGoal, setDepositGoal] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Estado para borrado
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handlers
  const handleOpenDeposit = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    if (goal) setDepositGoal({ id: goal.id, name: goal.name });
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      setIsDeleting(true);
      await deleteGoal(deleteId);
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Metas de Ahorro
          </h1>
          <p className="text-gray-500">
            Define objetivos y visualiza tu progreso
          </p>
        </div>

        <div className="flex gap-2">
          {' '}
          {/* 👈 Agrupamos botones */}
          {/* Botón TRANSFERIR (Solo visible si hay al menos 2 cuentas) */}
          {goals.length >= 2 && (
            <button
              onClick={() => setIsTransferOpen(true)}
              className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              <ArrowRightLeft size={20} />
              <span className="hidden sm:inline">Transferir</span>
            </button>
          )}
          <button
            onClick={handleOpenCreate} // 👈 ¡ESTO ES LO QUE FALTABA!
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-sm"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nueva Meta</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>
      </div>

      {/* Grid de Metas */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          Cargando tus metas...
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onDeposit={handleOpenDeposit}
              onDelete={setDeleteId}
              onEdit={handleOpenEdit}
            />
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
          <h3 className="text-lg font-medium text-gray-800">
            No tienes metas de ahorro
          </h3>
          <p className="text-gray-500 max-w-sm mt-1 mb-4">
            Comienza a ahorrar para tu próximo viaje, un fondo de emergencia o
            ese regalo especial.
          </p>
          <button
            onClick={handleOpenCreate}
            className="text-primary font-medium hover:underline"
          >
            Crear mi primera meta
          </button>
        </div>
      )}

      {/* --- MODALES --- */}

      {/* 1. Crear */}
      <CreateEditSavingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        goalToEdit={editingGoal}
      />

      {/* 2. Depositar */}
      <DepositModal
        isOpen={!!depositGoal}
        onClose={() => setDepositGoal(null)}
        goalId={depositGoal?.id || null}
        goalName={depositGoal?.name}
      />

      {/* 3. Borrar (Usando tu componente común) */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar meta de ahorro"
        message="¿Estás seguro? Esta acción no se puede deshacer y perderás el historial de progreso de esta meta."
        isLoading={isDeleting}
      />
      {/* 4. MODAL DE TRANSFERENCIA */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        goals={goals} // Le pasamos las metas para que llene los selects
      />
    </div>
  );
};
