import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionsTable } from '../components/TransactionsTable';
import { CreateTransactionModal } from '../components/CreateTransactionModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal'; // Usamos el componente común
import type { Transaction } from '../types';

export const TransactionsPage = () => {
  const {
    data,
    isLoading,
    filters,
    setFilters,
    deleteTransaction,
    isDeleting,
  } = useTransactions();

  // Estados Locales para Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );

  // --- HANDLERS ---

  // 1. Crear / Editar
  const handleOpenCreate = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  // 2. Borrado (Abre el Modal Local)
  const handleDelete = (id: string) => {
    setTransactionToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
    }
  };

  // 3. Búsqueda (Con reset de página)
  const handleSearch = (term: string) => {
    // Verificamos que setFilters exista antes de usarlo (seguridad extra)
    if (setFilters) {
      setFilters({
        ...filters,
        search: term,
        page: 1, // 👈 CLAVE: Volver a pág 1 al buscar
      });
    }
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

      {/* Barra de Herramientas (Buscador) */}
      <div className="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm items-center">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por descripción o categoría..."
            value={filters?.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        {/* Botón Decorativo de Filtros (Placeholder para futuro) 
        <div className="hidden sm:block">
          <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg border border-gray-200">
            <Filter size={20} />
          </button>
        </div>*/}
      </div>

      {/* Tabla de Transacciones */}
      <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Cargando movimientos...
          </div>
        ) : (
          <>
            <TransactionsTable
              transactions={data?.data || []} // Acceso seguro a la data paginada
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />

            {/* Paginación */}
            {data && data.meta.totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50 mt-auto">
                <button
                  disabled={filters.page === 1}
                  onClick={() =>
                    setFilters &&
                    setFilters({ ...filters, page: filters.page - 1 })
                  }
                  className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600 font-medium">
                  Página {filters.page} de {data.meta.totalPages}
                </span>
                <button
                  disabled={filters.page >= data.meta.totalPages}
                  onClick={() =>
                    setFilters &&
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                  className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}

            {/* Estado vacío */}
            {data?.data.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                No se encontraron movimientos.
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Crear/Editar */}
      <CreateTransactionModal
        key={isModalOpen ? editingTransaction?.id || 'new' : 'closed'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionToEdit={editingTransaction}
      />

      {/* Modal Confirmación Borrado */}
      <ConfirmationModal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar movimiento"
        message="Esta acción eliminará el registro permanentemente y afectará tus presupuestos históricos."
        isLoading={isDeleting}
      />
    </div>
  );
};
