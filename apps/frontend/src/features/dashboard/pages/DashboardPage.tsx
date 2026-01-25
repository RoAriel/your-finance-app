import { useState } from 'react'; // <--- Importamos useState
import { Plus } from 'lucide-react'; // Icono bonito
import { CreateTransactionModal } from '../../transactions/components/CreateTransactionModal'; // <--- Importamos el Modal
import { useTransactions } from '../../transactions/hooks/useTransactions';
import { TransactionsTable } from '../../transactions/components/TransactionsTable';

export const DashboardPage = () => {
  const { data, isLoading, error } = useTransactions(1);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para abrir/cerrar

  if (isLoading)
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  if (error)
    return <div className="p-8 text-red-500">Error cargando datos.</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header con Botón de Acción */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Resumen Financiero
          </h1>
          <p className="text-gray-500">Tus últimos movimientos</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors shadow-sm font-medium cursor-pointer"
        >
          <Plus size={20} />
          Nueva Transacción
        </button>
      </header>

      {/* Tabla */}
      <section>
        <TransactionsTable transactions={data?.data || []} />
      </section>

      {/* El Modal vive aquí, pero solo se muestra si isOpen={true} */}
      <CreateTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
