import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { TransactionsTable } from '../../transactions/components/TransactionsTable';
import { CreateTransactionModal } from '../../transactions/components/CreateTransactionModal';
import { StatsCards } from './components/StatsCards';
import type { Transaction } from '../../transactions/types';

export const DashboardPage = () => {
  const { data, isLoading } = useTransactions();

  // 1. Estado para controlar si el modal se ve o no
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Estado para guardar QUÉ estamos editando (null = modo creación)
  // 👇 AQUÍ ESTÁ LA VARIABLE QUE TE FALTABA
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Abrir para crear (limpia el estado de edición)
  const handleOpenCreate = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  // Abrir para editar (guarda la transacción a editar)
  const handleOpenEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Resumen Financiero
          </h1>
          <p className="text-gray-500">Tus últimos movimientos</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-sm cursor-pointer"
        >
          <Plus size={20} />
          Nueva Transacción
        </button>
      </div>

      {/* Cards de Balance */}
      <StatsCards />

      {/* Tabla de Transacciones */}
      <section>
        {isLoading ? (
          <p className="text-center py-10 text-gray-500">
            Cargando movimientos...
          </p>
        ) : (
          <TransactionsTable
            transactions={data?.data || []}
            onEdit={handleOpenEdit} // Pasamos la función al botón de lápiz
          />
        )}
      </section>

      {/* Modal Reutilizable */}
      <CreateTransactionModal
        // KEY MÁGICA: Fuerza a React a destruir y crear un modal nuevo
        // cuando cambia de "Crear" a "Editar" (o viceversa).
        key={isModalOpen ? editingTransaction?.id || 'new' : 'closed'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionToEdit={editingTransaction}
      />
    </div>
  );
};
