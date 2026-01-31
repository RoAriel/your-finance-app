import { Pencil, Trash2, TrendingUp, Wallet } from 'lucide-react';
import type { Account } from '../types';
import { AccountType } from '../types';

interface Props {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete?: (id: string) => void;
  // Opcional: acción rápida para depositar si es meta
  onDeposit?: (id: string) => void;
}

export const AccountCard = ({
  account,
  onEdit,
  onDelete,
  onDeposit,
}: Props) => {
  const isSavings = account.type === AccountType.SAVINGS;

  // Cálculo de progreso (si es ahorro)
  const progress =
    isSavings && account.targetAmount && account.targetAmount > 0
      ? Math.min((account.balance / account.targetAmount) * 100, 100)
      : 0;

  const formattedBalance = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: account.currency,
  }).format(account.balance);

  const formattedTarget = account.targetAmount
    ? new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: account.currency,
      }).format(account.targetAmount)
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative group">
      {/* Botones de acción flotantes (visibles en hover) */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(account)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
        >
          <Pencil size={16} />
        </button>
        {onDelete && (
          <button
            onClick={() => onDelete(account.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div
          className={`p-3 rounded-full ${isSavings ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}
        >
          {isSavings ? <TrendingUp size={24} /> : <Wallet size={24} />}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{account.name}</h3>
          <p className="text-xs text-gray-500">
            {isSavings ? 'Meta de Ahorro' : 'Billetera / Efectivo'}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-2xl font-bold text-gray-900">{formattedBalance}</p>
        {isSavings && formattedTarget && (
          <p className="text-xs text-gray-500 mt-1">de {formattedTarget}</p>
        )}
      </div>

      {isSavings && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium text-gray-600">
            <span>{progress.toFixed(0)}%</span>
            <span>Completado</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {onDeposit && (
            <button
              onClick={() => onDeposit(account.id)}
              className="w-full mt-4 py-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg font-medium transition-colors"
            >
              + Depositar
            </button>
          )}
        </div>
      )}
    </div>
  );
};
