import { useTransactions } from '../../transactions/hooks/useTransactions';
import { TransactionsTable } from '../../transactions/components/TransactionsTable';

export const DashboardPage = () => {
  const { data, isLoading, error } = useTransactions(1);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500">Error cargando datos.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">Resumen Financiero</h1>
        <p className="text-gray-500">Tus últimos movimientos</p>
      </header>

      <section>
        {/* Pasamos los datos limpios a la tabla */}
        <TransactionsTable transactions={data?.data || []} />
      </section>
    </div>
  );
};
