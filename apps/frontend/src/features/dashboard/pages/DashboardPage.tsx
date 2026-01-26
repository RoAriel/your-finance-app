import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { TransactionsTable } from '../../transactions/components/TransactionsTable';
import { CreateTransactionModal } from '../../transactions/components/CreateTransactionModal';
import { StatsCards } from '../components/StatsCards';
import { MonthSelector } from '../components/MonthSelector';
import { Pagination } from '../../../components/ui/Pagination';
import type { Transaction } from '../../transactions/types';
import { useDashboardReport } from '../hooks/useDashboardReport';
import { ExpensesChart } from '../components/ExpensesChart';

export const DashboardPage = () => {
  // 1. Estado de la Fecha Actual y Paginación
  const [currentDate, setCurrentDate] = useState(new Date());
  const [page, setPage] = useState(1);

  // 2. DEFINIR FILTROS (Importante: Definir esto ANTES de usarlo en los hooks)
  const filters = {
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  };

  // 3. Hook para la TABLA (Con paginación)
  const { data: transactionsData, isLoading: isLoadingTransactions } =
    useTransactions({
      ...filters, // Pasa mes y año
      page, // Pasa página actual
      limit: 10, // Límite por página
    });

  // 4. Hook para el REPORTE (Gráficos y Totales del mes completo)
  const { data: reportData, isLoading: isLoadingReport } =
    useDashboardReport(filters);

  // 🕵️‍♂️ AGREGA ESTO TEMPORALMENTE:
  console.log('--- DEBUG DASHBOARD ---');
  console.log('Filtros enviados:', filters);
  console.log('Datos recibidos (Reporte):', reportData);
  console.log('Chart Data:', reportData?.chartData);

  // Resetear a página 1 si cambiamos de mes
  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
    setPage(1);
  };

  // Estados del Modal
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Stats y Tabla (2/3 del ancho) */}
        <div className="lg:col-span-2 space-y-6">
          {/* TODO: Más adelante pasaremos reportData?.summary a las StatsCards */}
          <StatsCards />

          {/* TABLA DE TRANSACCIONES */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100 font-bold text-gray-700">
              Últimos Movimientos
            </div>

            <TransactionsTable
              transactions={transactionsData?.data || []}
              onEdit={handleOpenEdit}
            />

            {/* Paginación solo si hay metadata */}
            {transactionsData?.meta && (
              <Pagination
                page={transactionsData.meta.page}
                totalPages={transactionsData.meta.totalPages}
                hasPreviousPage={transactionsData.meta.hasPreviousPage}
                hasNextPage={transactionsData.meta.hasNextPage}
                onPageChange={setPage}
              />
            )}
          </section>
        </div>

        {/* Columna Derecha: Gráfico (1/3 del ancho) */}
        <div className="lg:col-span-1">
          <ExpensesChart
            data={reportData?.chartData || []}
            isLoading={isLoadingReport}
          />
        </div>
      </div>

      <CreateTransactionModal
        key={isModalOpen ? editingTransaction?.id || 'new' : 'closed'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionToEdit={editingTransaction}
      />
    </div>
  );
};
