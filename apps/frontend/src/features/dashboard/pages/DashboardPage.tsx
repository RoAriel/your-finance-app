import { useState, useMemo } from 'react'; // 👈 Agregamos useMemo
import { ArrowRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { TransactionsTable } from '../../transactions/components/TransactionsTable';
import { CreateTransactionModal } from '../../transactions/components/CreateTransactionModal';
import { StatsCards } from '../components/StatsCards';
import { MonthSelector } from '@/components/common/MonthSelector';
import { useDashboardReport } from '../hooks/useDashboardReport';
import { ExpensesChart } from '../components/ExpensesChart';
import { FinancialHealthWidget } from '../components/FinancialHealthWidget';
import { BudgetAlertsWidget } from '../components/BudgetAlertsWidget';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import type { Transaction } from '../../transactions/types';
import { useAccounts } from '../../accounts/hooks/useAccounts';
import { AccountType } from '../../accounts/types';
import { AccountSelector } from '@/components/common/AccountSelector'; // 👈 Importamos

export const DashboardPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 1. Estado para el filtro global de cuenta
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // 2. Filtros Dinámicos
  const filters = {
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    accountId: selectedAccountId || undefined, // Si es "", mandamos undefined
  };

  // 3. Hooks dependientes de 'filters'
  // (Asegúrate de que useTransactions y useDashboardReport acepten accountId internamente)
  const {
    data: transactionsData,
    deleteTransaction,
    isDeleting,
  } = useTransactions({
    ...filters,
    page: 1,
    limit: 5,
  });

  const { data: reportData, isLoading: isLoadingReport } =
    useDashboardReport(filters);

  // 4. Cuentas para el cálculo de saldo local
  // Traemos TODAS para poder filtrar por ID, no solo wallets
  const { accounts: allAccounts, isLoading: isLoadingAccounts } = useAccounts(
    {}
  );

  // 5. Lógica de Saldo Inteligente
  const displayedBalance = useMemo(() => {
    if (selectedAccountId) {
      // Si hay filtro, buscamos esa cuenta específica
      const account = allAccounts.find((a) => a.id === selectedAccountId);
      return account ? Number(account.balance) : 0;
    } else {
      // Si NO hay filtro, mantenemos tu lógica original: Sumar solo WALLETS (Liquidez)
      return allAccounts
        .filter((a) => a.type === AccountType.WALLET)
        .reduce((acc, curr) => acc + Number(curr.balance), 0);
    }
  }, [selectedAccountId, allAccounts]);

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
    setTransactionToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
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

        {/* Controles: Selector Mes + Selector Cuenta + Botón Add */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* 👇 Selector de Cuenta Global */}
          <div className="w-full sm:w-48">
            <AccountSelector
              value={selectedAccountId}
              onChange={setSelectedAccountId}
              label="" // Sin label para que quede inline limpio
              showAllOption={true} // Habilita "Todas las cuentas"
              className="mb-0" // Reset margin inferior del componente base
            />
          </div>

          <MonthSelector currentDate={currentDate} onChange={setCurrentDate} />

          <button
            onClick={handleOpenCreate}
            className="bg-primary text-white p-2 rounded-lg hover:bg-primary-hover shadow-sm md:hidden self-end sm:self-auto"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda */}
        <div className="lg:col-span-2 space-y-6">
          <StatsCards
            income={reportData?.summary?.income || 0}
            expenses={reportData?.summary?.expense || 0}
            // Pasamos el saldo calculado dinámicamente
            balance={displayedBalance}
            isLoading={isLoadingReport || isLoadingAccounts}
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

        {/* Columna Derecha */}
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
