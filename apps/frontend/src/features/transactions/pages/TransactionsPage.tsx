import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';

// Hooks y Componentes
import { useTransactions } from '../hooks/useTransactions';
import { TransactionsTable } from '../components/TransactionsTable';
import { CreateTransactionModal } from '../components/CreateTransactionModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { SearchBar } from '../../../components/common/SearchBar'; // 👈 Tu buscador (Sprint 4 Parte 1)
import { Pagination } from '../../../components/ui/Pagination'; // 👈 Tu paginación nueva

import type { Transaction } from '../types';

export const TransactionsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // --- ESTADOS DE UI ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // --- ESTADOS DE FILTROS ---
  // Separamos 'page' para manejar reseteos fáciles al buscar
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    accountId: searchParams.get('accountId') || '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    search: '',
  });

  // --- HOOK PRINCIPAL ---
  // 👇 Ahora pasamos los filtros al hook para que el backend haga el trabajo
  const {
    transactions, // Usamos la data procesada del hook
    meta, // Info de paginación que viene del backend
    isLoading,
    deleteTransaction,
  } = useTransactions({
    ...filters,
    page, // Agregamos la página actual
    limit: 10, // Tamaño de página fijo (o puedes hacerlo dinámico)
  });

  // --- HANDLERS ---

  const handleSearch = (searchValue: string) => {
    setFilters((prev) => ({ ...prev, search: searchValue }));
    setPage(1); // Importante: Al buscar, volvemos a la página 1
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Opcional: Scroll al top de la tabla
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAccountFilter = () => {
    setFilters((prev) => ({ ...prev, accountId: '' }));
    setSearchParams({});
    setPage(1);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header & Filtros */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Movimientos</h1>

          {/* Chip de Filtro Activo */}
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
            <p className="text-gray-500 text-sm">
              Gestiona tus ingresos y gastos
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* 👇 1. INTEGRACIÓN DEL BUSCADOR */}
          <SearchBar onSearch={handleSearch} placeholder="Buscar concepto..." />

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover flex items-center justify-center gap-2 whitespace-nowrap shadow-sm transition-colors"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nueva</span>
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center min-h-75">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Tabla */}
            <div className="flex-1 overflow-auto">
              <TransactionsTable
                transactions={transactions || []}
                onEdit={handleEdit}
                onDelete={(id) => setTransactionToDelete(id)}
              />
            </div>

            {/* 👇 2. INTEGRACIÓN DE PAGINACIÓN */}
            {meta && (
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                hasPreviousPage={meta.hasPreviousPage}
                hasNextPage={meta.hasNextPage}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>

      {/* Modales */}
      <CreateTransactionModal
        key={
          isModalOpen
            ? editingTransaction
              ? editingTransaction.id
              : 'new'
            : 'closed'
        }
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        transactionToEdit={editingTransaction}
      />

      <ConfirmationModal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar movimiento"
        message="¿Estás seguro de eliminar este movimiento? El saldo de la cuenta se recalculará."
      />
    </div>
  );
};
