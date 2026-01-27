import { Edit2, Trash2, AlertTriangle, CheckCircle, Ban } from 'lucide-react';
import type { Budget } from '../services/budgets.service';
import { formatCurrency } from '../../../utils/formatters';

interface Props {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export const BudgetCard = ({ budget, onEdit, onDelete }: Props) => {
  // 1. Lógica de colores según el estado que viene del back
  const getStatusColor = () => {
    switch (budget.status) {
      case 'EXCEEDED':
        return 'bg-red-500 text-red-600';
      case 'WARNING':
        return 'bg-yellow-500 text-yellow-600';
      default:
        return 'bg-green-500 text-green-600'; // OK
    }
  };

  const getProgressBarColor = () => {
    switch (budget.status) {
      case 'EXCEEDED':
        return 'bg-red-500';
      case 'WARNING':
        return 'bg-yellow-400';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusIcon = () => {
    switch (budget.status) {
      case 'EXCEEDED':
        return <Ban size={16} />;
      case 'WARNING':
        return <AlertTriangle size={16} />;
      default:
        return <CheckCircle size={16} />;
    }
  };

  // Aseguramos que la barra no se salga del 100% visualmente
  const progressWidth = Math.min(Math.max(budget.percentage, 0), 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header: Categoría y Acciones */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">
            {budget.categoryName}
          </h3>
          <div
            className={`flex items-center gap-1.5 text-xs font-bold mt-1 ${getStatusColor().split(' ')[1]}`}
          >
            {getStatusIcon()}
            <span>
              {budget.status === 'EXCEEDED'
                ? 'Excedido'
                : budget.status === 'WARNING'
                  ? 'Cuidado'
                  : 'En orden'}
            </span>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onEdit(budget)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Barra de Progreso */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-gray-600">
          <span>{budget.percentage}%</span>
          <span>{formatCurrency(budget.remaining)} restantes</span>
        </div>

        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor()}`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      {/* Footer: Montos */}
      <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-sm">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs">Gastado</span>
          <span className="font-semibold text-gray-800">
            {formatCurrency(budget.spent)}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-400 text-xs">Límite</span>
          <span className="font-bold text-gray-900">
            {formatCurrency(budget.amount)}
          </span>
        </div>
      </div>
    </div>
  );
};
