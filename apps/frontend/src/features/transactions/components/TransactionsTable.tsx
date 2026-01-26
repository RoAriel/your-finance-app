import {
  Edit2,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Lock,
} from 'lucide-react';
import type { Transaction } from '../types';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { useDeleteTransaction } from '../hooks/useTransactions';

interface Props {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
}

export const TransactionsTable = ({ transactions, onEdit }: Props) => {
  // Manejo de estado vacío
  const deleteMutation = useDeleteTransaction();

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de querer eliminar esta transacción?')) {
      deleteMutation.mutate(id);
    }
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
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoría
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map((tx) => {
            const isExpense = tx.type === 'expense';
            const amountColor = isExpense ? 'text-red-600' : 'text-green-600';
            const amountSign = isExpense ? '-' : '+';

            return (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                {/* 1. Fecha */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(tx.date)}
                </td>

                {/* 2. Categoría (con bolita de color) */}
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

                {/* 3. Descripción */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {tx.description}
                </td>

                {/* 4. Monto (Alineado a la derecha) */}
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${amountColor}`}
                >
                  {amountSign} {formatCurrency(tx.amount, tx.currency)}
                </td>
                {/* 5. NUEVA CELDA DE ACCIONES */}

                {/* Columna de Acciones */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* BOTÓN EDITAR */}
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>

                    {/* Botón Borrar (ya existía) */}
                    <button
                      onClick={() => handleDelete(tx.id)}
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
