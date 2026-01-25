import { ArrowDown, ArrowUp, Wallet } from 'lucide-react';
import { useBalance } from '../../../transactions/hooks/useTransactions';
import { formatCurrency } from '../../../../utils/formatters';

export const StatsCards = () => {
  const { data, isLoading } = useBalance();

  // Skeleton Loading (Efecto de carga bonito)
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const { income = 0, expenses = 0, balance = 0 } = data || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* CARD 1: BALANCE TOTAL */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">Balance Total</p>
          <h3
            className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}
          >
            {formatCurrency(balance)}
          </h3>
        </div>
        <div
          className={`p-3 rounded-full ${balance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}
        >
          <Wallet size={24} />
        </div>
      </div>

      {/* CARD 2: INGRESOS */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">Ingresos</p>
          <h3 className="text-2xl font-bold mt-1 text-green-600">
            {formatCurrency(income)}
          </h3>
        </div>
        <div className="bg-green-50 p-3 rounded-full text-green-600">
          <ArrowUp size={24} />
        </div>
      </div>

      {/* CARD 3: GASTOS */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">Gastos</p>
          <h3 className="text-2xl font-bold mt-1 text-red-600">
            {formatCurrency(expenses)}
          </h3>
        </div>
        <div className="bg-red-50 p-3 rounded-full text-red-600">
          <ArrowDown size={24} />
        </div>
      </div>
    </div>
  );
};
