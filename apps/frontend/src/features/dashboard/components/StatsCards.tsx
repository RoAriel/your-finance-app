import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

interface Props {
  income: number;
  expenses: number;
  balance: number;
  isLoading: boolean;
}

export const StatsCards = ({ income, expenses, balance, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse h-32"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Saldo Total (Liquidez) */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Wallet size={80} className="text-blue-600" />
        </div>
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">
            Saldo Disponible
          </p>
          <h3 className="text-2xl font-bold text-gray-800">
            {formatCurrency(balance)}
          </h3>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-lg">
          <Wallet size={14} />
          <span>En Billeteras</span>
        </div>
      </div>

      {/* 2. Ingresos del Mes */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <TrendingUp size={80} className="text-green-600" />
        </div>
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">
            Ingresos (Mes)
          </p>
          <h3 className="text-2xl font-bold text-gray-800">
            {formatCurrency(income)}
          </h3>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg">
          <ArrowUpRight size={14} />
          <span>Entradas registradas</span>
        </div>
      </div>

      {/* 3. Gastos del Mes */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
        <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <TrendingDown size={80} className="text-red-600" />
        </div>
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">Gastos (Mes)</p>
          <h3 className="text-2xl font-bold text-gray-800">
            {formatCurrency(expenses)}
          </h3>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 w-fit px-2 py-1 rounded-lg">
          <ArrowDownRight size={14} />
          <span>Salidas registradas</span>
        </div>
      </div>
    </div>
  );
};
