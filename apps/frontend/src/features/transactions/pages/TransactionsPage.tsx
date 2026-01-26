import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
// CAMBIO IMPORTANTE: Importamos TransactionsTable directamente, ya que es el que tiene la lógica nueva
import { TransactionsTable } from '../components/TransactionsTable';
import { CreateTransactionModal } from '../components/CreateTransactionModal';
import type { Transaction } from '../types';
import { useConfirm } from '../../../context/ConfirmContext'; // Hook Global
import type { PaginatedResponse } from '../../../types';

export const TransactionsPage = () => {
  const {
    data: rawData, // 1. Renombramos 'data' (que sí existe) a 'rawData'
    deleteTransaction,
    filters,
    setFilters,
  } = useTransactions();

  const { confirm } = useConfirm();

  const transactions = Array.isArray(rawData)
    ? (rawData as Transaction[])
    : (rawData as PaginatedResponse<Transaction>)?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const handleOpenCreate = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  // ✅ LÓGICA DE BORRADO
  const handleDelete = (id: string) => {
    confirm({
      title: '¿Eliminar Transacción?',
      message:
        'Esta acción borrará el movimiento permanentemente y afectará tus balances históricos.',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        await deleteTransaction(id);
      },
    });
  };

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Movimientos</h1>
          <p className="text-gray-500">Historial completo de tus finanzas</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-sm"
        >
          <Plus size={20} />
          <span>Nueva Transacción</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por descripción..."
            value={filters?.search || ''}
            onChange={(e) =>
              setFilters && setFilters({ ...filters, search: e.target.value })
            }
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        </div>
      </div>

      {/* Tabla de Transacciones */}
      <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {/* 👇 AQUÍ FALTABA PASAR EL PROP onDelete 👇 */}
        <TransactionsTable
          transactions={transactions || []}
          onEdit={handleOpenEdit}
          onDelete={handleDelete} // <--- ¡ESTO ES LO QUE ARREGLA EL ERROR!
        />
      </div>

      {/* Modal */}
      <CreateTransactionModal
        key={isModalOpen ? editingTransaction?.id || 'new' : 'closed'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionToEdit={editingTransaction}
      />
    </div>
  );
};
