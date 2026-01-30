import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useCurrency } from '../../../hooks/useCurrency';

// 1. Definimos la "forma" de los datos que esperamos recibir
interface StatsCardsProps {
  income: number;
  expenses: number;
  balance: number;
  isLoading?: boolean;
}

export const StatsCards = ({
  income = 0,
  expenses = 0,
  balance = 0,
  isLoading = false,
}: StatsCardsProps) => {
  const { format } = useCurrency(); // Usamos tu formateador global

  // 2. Estado de Carga (Skeleton) para que no parpadee feo
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-32 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* CARD INGRESOS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">Ingresos</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {format(income)}
          </h3>
        </div>
        <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
          <TrendingUp size={24} />
        </div>
      </div>

      {/* CARD GASTOS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">Gastos</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {format(expenses)}
          </h3>
        </div>
        <div className="p-3 bg-red-100 rounded-full text-red-600">
          <TrendingDown size={24} />
        </div>
      </div>

      {/* CARD BALANCE */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">Balance Total</p>
          <h3
            className={`text-2xl font-bold mt-1 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}
          >
            {format(balance)}
          </h3>
        </div>
        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
          <Wallet size={24} />
        </div>
      </div>
    </div>
  );
};
