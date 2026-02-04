import { Edit2, Trash2, Lock, HelpCircle } from 'lucide-react';
import type { Transaction } from '../types';
import { formatDate } from '../../../utils/formatters';
import { useCurrency } from '../../../hooks/useCurrency';
import { ICON_MAP } from '../../categories/constants';
// 👇 1. Importamos el Enum para comparar correctamente
import { CategoryType } from '../../categories/types';

interface Props {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionsTable = ({
  transactions,
  onEdit,
  onDelete,
}: Props) => {
  const { format: formatUserCurrency } = useCurrency();

  const formatTxAmount = (amount: number, txCurrency?: string) => {
    if (txCurrency) {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: txCurrency,
      }).format(amount);
    }
    return formatUserCurrency(amount);
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        No hay transacciones registradas aún.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4 text-left">Descripción</th>
            <th className="px-6 py-4 text-left">Monto</th>
            <th className="px-6 py-4 text-left">Categoría</th>
            <th className="px-6 py-4 text-left hidden sm:table-cell">Fecha</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map((tx) => {
            // 👇 2. CORRECCIÓN: Usamos el Enum en lugar de strings 'magic'
            const isExpense = tx.type === CategoryType.EXPENSE;
            const isIncome = tx.type === CategoryType.INCOME;

            // Si tu Enum tuviera TRANSFER, usaríamos CategoryType.TRANSFER
            // Por ahora, asumimos que si no es ninguno de los dos, podría ser transferencia interna
            // Ojo: Esto depende de si agregaste TRANSFER a tu Enum en steps anteriores.
            //const isTransfer = !isExpense && !isIncome && tx.type === 'TRANSFER';

            // Lógica de colores y signos
            let amountColor = 'text-gray-600';
            let amountSign = '';

            if (isExpense) {
              amountColor = 'text-red-600';
              amountSign = '-';
            } else if (isIncome) {
              amountColor = 'text-green-600';
              amountSign = '+';
            } else {
              amountColor = 'text-blue-600';
              amountSign = '';
            }

            // Resolución del Icono Visual
            const iconKey = tx.category?.icon || 'HelpCircle';
            const IconComp = ICON_MAP[iconKey] || HelpCircle;
            const categoryColor = tx.category?.color || '#cbd5e1';

            return (
              <tr
                key={tx.id}
                className="hover:bg-gray-50/80 transition-colors group"
              >
                {/* 1. Descripción */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span
                      className="text-sm font-medium text-gray-900 truncate max-w-50"
                      title={tx.description}
                    >
                      {tx.description}
                    </span>
                    <span className="text-xs text-gray-400 sm:hidden">
                      {formatDate(tx.date)}
                    </span>
                    {/*
                    {isTransfer && (
                      <span className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-100 w-fit">
                        Transferencia
                      </span>
                    )}*/}
                  </div>
                </td>

                {/* 2. Monto */}
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${amountColor}`}
                >
                  {amountSign}
                  {formatTxAmount(Number(tx.amount), tx.currency)}
                </td>

                {/* 3. Categoría */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm shrink-0"
                      style={{ backgroundColor: categoryColor }}
                    >
                      <IconComp size={14} />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-gray-700">
                        {tx.category?.name || 'Sin categoría'}
                      </span>
                      {tx.category?.isFixed && (
                        <Lock size={12} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </td>

                {/* 4. Fecha */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                  {formatDate(tx.date)}
                </td>

                {/* 5. Acciones */}
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(tx.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
