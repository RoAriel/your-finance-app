import { Edit2, Trash2, Lock } from 'lucide-react';
import type { Transaction } from '../types';
import { formatDate } from '../../../utils/formatters'; // Quitamos formatCurrency viejo
import { useCurrency } from '../../../hooks/useCurrency'; // 👈 Importamos nuestro hook nuevo

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
  // 1. Instanciamos el hook, que usa la moneda del usuario por defecto
  const { format: formatUserCurrency } = useCurrency();

  // Función helper local para decidir qué moneda usar
  const formatTxAmount = (amount: number, txCurrency?: string) => {
    // Si la transacción tiene moneda explícita (ej: 'USD'), la usamos.
    // Si no, usamos el formateador del usuario (que ya sabe si es ARS/EUR).
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
      <div className="text-center py-10 text-gray-500">
        No hay transacciones registradas aún.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoría
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map((tx) => {
            const isExpense = tx.type === 'expense';
            // Si es 'income', verde. Si es 'transfer', azul (neutral).
            const isTransfer = tx.type === 'transfer';

            let amountColor = 'text-gray-600';
            let amountSign = '';

            if (isExpense) {
              amountColor = 'text-red-600';
              amountSign = '-';
            } else if (tx.type === 'income') {
              amountColor = 'text-green-600';
              amountSign = '+';
            } else {
              // Transferencia o Depósito interno
              amountColor = 'text-blue-600';
              amountSign = '↻';
            }

            return (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {tx.description}
                  {/* Etiqueta pequeña si es transferencia */}
                  {isTransfer && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-blue-100 text-blue-700 font-medium">
                      Interno
                    </span>
                  )}
                </td>

                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${amountColor}`}
                >
                  {amountSign} {formatTxAmount(Number(tx.amount), tx.currency)}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {tx.category && (
                      <span
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: tx.category.color }}
                      />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {tx.category?.name || 'Sin categoría'}
                    </span>
                    {tx.category?.isFixed && (
                      <div className="ml-2 text-gray-400" title="Gasto Fijo">
                        <Lock size={14} />
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(tx.date)}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(tx.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
