import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
// Asegúrate de que estas rutas de importación sean correctas según tu estructura
import { useTransactions } from '../hooks/useTransactions';
import { TransactionsTable } from '../components/TransactionsTable';
import { CreateTransactionModal } from '../components/CreateTransactionModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import type { Transaction } from '../types';

export const TransactionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Inicializar filtros leyendo la URL
  const [filters, setFilters] = useState({
    accountId: searchParams.get('accountId') || '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    search: '',
  });

  // Hook para obtener transacciones
  // 👇 Aquí usamos las variables que antes daban error por "unused"
  const { data, isLoading, deleteTransaction } = useTransactions();

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction); // Guardamos la data a editar
    setIsModalOpen(true); // Abrimos el modal
  };

  const handleOpenDelete = (id: string) => {
    setTransactionToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null); // Limpiamos al cerrar
  };

  // Función para limpiar el filtro de cuenta
  const clearAccountFilter = () => {
    setFilters((prev) => ({ ...prev, accountId: '' }));
    setSearchParams({}); // Limpia la URL visualmente
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Movimientos</h1>

          {/* Indicador Visual: "Viendo Historial de Cuenta X" */}
          {filters.accountId ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">Filtrado por cuenta</span>
              <button
                onClick={clearAccountFilter}
                className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
              >
                Cuenta Específica <X size={12} />
              </button>
            </div>
          ) : (
            <p className="text-gray-500">Historial completo de transacciones</p>
          )}
        </div>

        {/* Botón Nueva (Usa setIsModalOpen y Plus) */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover flex items-center gap-2"
        >
          <Plus size={20} /> Nueva
        </button>
      </div>

      {isLoading ? (
        // 1. Estado de Carga
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        // 2. Estado de Datos Listos (Sin pasar isLoading)
        <TransactionsTable
          transactions={data?.data || []}
          onEdit={handleEdit}
          onDelete={handleOpenDelete}
        />
      )}

      {/* Modal (Usa isModalOpen) */}
      <CreateTransactionModal
        key={editingTransaction ? editingTransaction.id : 'new'} // Truco para resetear formulario
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        transactionToEdit={editingTransaction} // Pasamos la data
      />
      <ConfirmationModal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar movimiento"
        message="¿Seguro? Esto afectará tus balances."
      />
    </div>
  );
};
