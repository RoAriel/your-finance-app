import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { TransactionsTable } from '../../transactions/components/TransactionsTable';
import { CreateTransactionModal } from '../../transactions/components/CreateTransactionModal';
import { StatsCards } from './components/StatsCards';
import { MonthSelector } from './components/MonthSelector';
import { Pagination } from '../../../components/ui/Pagination';
import type { Transaction } from '../../transactions/types';

export const DashboardPage = () => {
  // 1. Estado de la Fecha Actual (Por defecto: Hoy)
  const [currentDate, setCurrentDate] = useState(new Date());

  const [page, setPage] = useState(1);

  // 2. Calculamos los filtros basados en la fecha seleccionada
  const filters = {
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    page, // <--- Dinámico
    limit: 10, // <--- Más ligero (muestra de a 10)
  };

  // 3. Pasamos los filtros al hook. ¡Magia! React Query recargará al cambiar filters.
  const { data, isLoading } = useTransactions(filters);
  const meta = data?.meta;

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
    setPage(1);
  };

  // Estados del Modal (ya los tenías)
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

  return (
    <div className="p-6 space-y-6">
      {/* Header con Título y SELECTOR DE FECHA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Resumen Financiero
          </h1>
          <p className="text-gray-500">Administra tus gastos mensuales</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Componente Nuevo */}
          <MonthSelector
            currentDate={currentDate}
            onChange={handleDateChange}
          />

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-sm cursor-pointer"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nueva</span>
          </button>
        </div>
      </div>

      {/* StatsCards (Nota: Estas deberían filtrarse también, pero por ahora muestran el global o lo que devuelva el endpoint) */}
      <StatsCards />

      {/* Tabla */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Nota: Moví el borde/shadow al contenedor section para envolver tabla + paginación */}

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <TransactionsTable
              transactions={data?.data || []}
              onEdit={handleOpenEdit}
            />

            {/* 3. COMPONENTE DE PAGINACIÓN */}
            {meta && (
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                hasPreviousPage={meta.hasPreviousPage}
                hasNextPage={meta.hasNextPage}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </section>

      <CreateTransactionModal
        key={isModalOpen ? editingTransaction?.id || 'new' : 'closed'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionToEdit={editingTransaction}
      />
    </div>
  );
};
