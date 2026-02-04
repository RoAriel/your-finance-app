import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';

// Hooks y Componentes
import { useTransactions } from '../hooks/useTransactions';
import { TransactionsTable } from '../components/TransactionsTable';
import { CreateTransactionModal } from '../components/CreateTransactionModal';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import { SearchBar } from '../../../components/common/SearchBar'; // 👈 Tu buscador (Sprint 4 Parte 1)
import { Pagination } from '../../../components/ui/Pagination'; // 👈 Tu paginación nueva
import { AccountSelector } from '../../../components/common/AccountSelector'; // Ajusta la ruta si moviste el componente
import { AccountType } from '../../accounts/types'; // Ajusta ruta
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
    startDate: '',
    endDate: '',
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
    setPage(1);
  };

  const handleAccountChange = (accountId: string) => {
    setFilters((prev) => ({ ...prev, accountId }));
    setPage(1);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Movimientos</h1>
          <p className="text-gray-500 text-sm">
            Gestiona tus ingresos y gastos
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover flex items-center justify-center gap-2 whitespace-nowrap shadow-sm transition-colors"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Nueva</span>
        </button>
      </div>

      {/* 🛠️ BARRA DE FILTROS */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* 1. Buscador (4 col) */}
        <div className="md:col-span-4 w-full">
          <SearchBar onSearch={handleSearch} placeholder="Buscar concepto..." />
        </div>

        {/* 2. Selector de Cuenta (3 col) */}
        <div className="md:col-span-3 w-full">
          <AccountSelector
            value={filters.accountId}
            onChange={handleAccountChange}
            type={AccountType.WALLET}
            label="Filtrar por Cuenta"
            placeholder="Todas las cuentas"
            allowEmpty={true} // 👈 MAGIA: Permite seleccionar "Todas"
            className="w-full"
          />
        </div>

        {/* 3. Rango de Fechas (5 col) */}
        <div className="md:col-span-5 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rango de Fechas
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleDateChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
              placeholder="Desde"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleDateChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
              placeholder="Hasta"
            />
          </div>
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

            {/* Paginación */}
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
        message="¿Estás seguro? El saldo de la cuenta se recalculará."
      />
    </div>
  );
};
