import { useState } from 'react';
import { Plus, ArrowRightLeft, Wallet, Target } from 'lucide-react';
import { useSavings } from '../hooks/useSavings';
import { SavingsGoalCard } from '../components/SavingsGoalCard';
import { CreateEditSavingsModal } from '../components/CreateEditSavingsModal.tsx'; // Nota: quité el .tsx de la importación, no suele ser necesario
import { DepositModal } from '../components/DepositModal';
import { TransferModal } from '../components/TransferModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import type { SavingsGoal } from '../types';

export const SavingsPage = () => {
  // 1. Hook Principal
  const { goals, isLoading, deleteGoal } = useSavings();

  // 2. Lógica de Separación (Lo Nuevo ✨)
  // - Wallets: Sin monto objetivo o monto 0
  const wallets =
    goals?.filter((g) => !g.targetAmount || Number(g.targetAmount) === 0) || [];
  // - SavingsGoals: Con monto objetivo
  const savingsGoals =
    goals?.filter((g) => g.targetAmount && Number(g.targetAmount) > 0) || [];

  // 3. Estados de Modales (Lo tuyo conservado)
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Estado para depósito
  const [depositGoal, setDepositGoal] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Estado para borrado
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 4. Handlers (Conservados)
  const handleOpenCreate = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        <div className="animate-pulse">Cargando tus fondos...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Cuentas</h1>
          <p className="text-gray-500">
            Administra tu efectivo y tus objetivos de ahorro
          </p>
        </div>

        <div className="flex gap-2">
          {/* Botón Transferir Global */}
          {goals.length >= 2 && (
            <button
              onClick={() => setIsTransferOpen(true)}
              className="flex items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
            >
              <ArrowRightLeft size={18} />
              <span className="hidden sm:inline">Transferir</span>
            </button>
          )}

          {/* Botón Nueva Meta/Cuenta */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-sm shadow-primary/30"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nueva Cuenta / Meta</span>
            <span className="sm:hidden">Crear</span>
          </button>
        </div>
      </div>

      {/* --- SECCIÓN 1: BILLETERAS Y EFECTIVO (Cuentas Corrientes) --- */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-emerald-100 rounded text-emerald-600">
            <Wallet size={18} />
          </div>
          <h2 className="text-lg font-bold text-gray-700">
            Cuentas y Efectivo
          </h2>
        </div>

        {wallets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((goal) => (
              <SavingsGoalCard
                key={goal.id}
                goal={goal}
                onDeposit={handleOpenDeposit}
                onDelete={setDeleteId}
                onEdit={handleOpenEdit}
                // Tip: Podrías pasar una prop extra 'isWallet={true}' si quieres ocultar la barra de progreso en el futuro
              />
            ))}
          </div>
        ) : (
          <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-sm text-gray-400">
            No tienes cuentas corrientes activas.
          </div>
        )}
      </section>

      {/* --- SECCIÓN 2: METAS DE AHORRO --- */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-blue-100 rounded text-blue-600">
            <Target size={18} />
          </div>
          <h2 className="text-lg font-bold text-gray-700">Metas de Ahorro</h2>
        </div>

        {savingsGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savingsGoals.map((goal) => (
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
          <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
            <p className="text-gray-500 text-sm mb-2">
              Aún no tienes objetivos de ahorro definidos.
            </p>
            <button
              onClick={handleOpenCreate}
              className="text-primary font-medium hover:underline text-sm"
            >
              Crear mi primera meta
            </button>
          </div>
        )}
      </section>

      {/* --- MODALES (Exactamente los tuyos) --- */}

      {/* 1. Crear / Editar */}
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

      {/* 3. Borrar */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar cuenta"
        message="¿Estás seguro? Se perderá el historial de movimientos asociado a esta cuenta."
        isLoading={isDeleting}
      />

      {/* 4. Transferir */}
      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        goals={goals} // Pasamos TODOS (goals) para que puedan transferir entre wallet y meta
      />
    </div>
  );
};
