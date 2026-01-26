import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionsTable } from '../components/TransactionsTable';
import { CreateTransactionModal } from '../components/CreateTransactionModal';
import { Pagination } from '../../../components/ui/Pagination';
import { MonthSelector } from '../../dashboard/components/MonthSelector'; // Reutilizamos el selector
import type { Transaction } from '../types';

export const TransactionsPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const filters = {
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  };

  const { data, isLoading } = useTransactions({
    ...filters,
    page,
    limit: 10, // Aquí sí mantenemos paginación de 10
  });

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
    setPage(1);
  };

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
      {/* Header Operativo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Movimientos</h1>
          <p className="text-gray-500">
            Gestión detallada de ingresos y gastos
          </p>
        </div>

        <div className="flex items-center gap-4">
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

      {/* Tabla Completa */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-125">
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <TransactionsTable
              transactions={data?.data || []}
              onEdit={handleOpenEdit}
            />

            {data?.meta && (
              <div className="mt-auto">
                <Pagination
                  page={data.meta.page}
                  totalPages={data.meta.totalPages}
                  hasPreviousPage={data.meta.hasPreviousPage}
                  hasNextPage={data.meta.hasNextPage}
                  onPageChange={setPage}
                />
              </div>
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
