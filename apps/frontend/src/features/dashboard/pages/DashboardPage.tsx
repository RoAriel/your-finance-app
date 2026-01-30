import { useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom'; // <--- Necesario para navegar
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { TransactionsTable } from '../../transactions/components/TransactionsTable';
import { CreateTransactionModal } from '../../transactions/components/CreateTransactionModal';
import { StatsCards } from '../components/StatsCards';
import { MonthSelector } from '../components/MonthSelector';
import { useDashboardReport } from '../hooks/useDashboardReport';
import { ExpensesChart } from '../components/ExpensesChart';
import { FinancialHealthWidget } from '../components/FinancialHealthWidget';
import { BudgetAlertsWidget } from '../components/BudgetAlertsWidget';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import type { Transaction } from '../../transactions/types';

export const DashboardPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filtros fijos (Sin página)
  const filters = {
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  };

  // 1. Hook para TABLA RESUMEN (Solo 5 items, sin paginación)
  const {
    data: transactionsData,
    deleteTransaction,
    isDeleting,
  } = useTransactions({
    ...filters,
    page: 1,
    limit: 5,
  });

  // 2. Hook para REPORTE (Gráficos)
  const { data: reportData, isLoading: isLoadingReport } =
    useDashboardReport(filters);

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(
    null
  );

  const handleOpenCreate = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setTransactionToDelete(id); // Guardamos el ID y esto abre el modal (porque ID existe)
  };

  const handleConfirmDelete = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete);
      setTransactionToDelete(null); // Cerramos el modal
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Simplificado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Resumen Financiero
          </h1>
          <p className="text-gray-500">
            Panorama general de{' '}
            {new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(
              currentDate
            )}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />

          <button
            onClick={handleOpenCreate}
            className="bg-primary text-white p-2 rounded-lg hover:bg-primary-hover shadow-sm md:hidden"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Stats y Gráfico (Ocupa 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <StatsCards
            income={reportData?.summary?.income || 0}
            expenses={reportData?.summary?.expense || 0} // Nota: Tu backend devuelve 'expense' en singular
            balance={reportData?.summary?.totalAvailable || 0}
            isLoading={isLoadingReport}
          />
          <BudgetAlertsWidget month={filters.month} year={filters.year} />

          {reportData?.expensesAnalysis && (
            <FinancialHealthWidget
              fixed={reportData.expensesAnalysis.fixed}
              variable={reportData.expensesAnalysis.variable}
            />
          )}

          <ExpensesChart
            data={reportData?.chartData || []}
            isLoading={isLoadingReport}
          />
        </div>

        {/* Columna Derecha: Lista Rápida (Ocupa 1/3) */}
        <div className="lg:col-span-1">
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Últimos Movimientos</h3>
              <Link
                to="/transactions"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Ver todo <ArrowRight size={14} />
              </Link>
            </div>

            <div className="overflow-hidden">
              {/* Usamos la misma tabla pero en contexto reducido */}
              <TransactionsTable
                transactions={transactionsData?.data || []}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            </div>

            {(!transactionsData?.data ||
              transactionsData.data.length === 0) && (
              <div className="p-8 text-center text-gray-400 text-sm">
                No hay movimientos recientes.
              </div>
            )}

            <div className="p-4 mt-auto border-t border-gray-50">
              <button
                onClick={handleOpenCreate}
                className="w-full py-2 border-2 border-dashed border-gray-200 text-gray-500 rounded-lg hover:border-primary hover:text-primary transition-colors text-sm font-medium"
              >
                + Agregar Rápido
              </button>
            </div>
          </section>
        </div>
      </div>

      <CreateTransactionModal
        key={isModalOpen ? editingTransaction?.id || 'new' : 'closed'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionToEdit={editingTransaction}
      />

      <ConfirmationModal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar movimiento"
        message="¿Estás seguro de que deseas eliminar este registro? Esta acción afectará tus reportes y presupuestos."
        isLoading={isDeleting}
      />
    </div>
  );
};
