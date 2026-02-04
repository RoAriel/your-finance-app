import {
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Ban,
  HelpCircle,
} from 'lucide-react';
import type { Budget } from '../services/budgets.service';
import { formatCurrency } from '../../../utils/formatters';
// 👇 Importamos el mapa de iconos
import { ICON_MAP } from '../../categories/constants';

interface Props {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export const BudgetCard = ({ budget, onEdit, onDelete }: Props) => {
  // 👇 Resolvemos el icono real
  const IconComponent = ICON_MAP[budget.categoryIcon] || HelpCircle;

  const getStatusColor = () => {
    switch (budget.status) {
      case 'EXCEEDED':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'WARNING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      default:
        return 'bg-green-50 text-green-700 border-green-100';
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
        return <Ban size={14} />;
      case 'WARNING':
        return <AlertTriangle size={14} />;
      default:
        return <CheckCircle size={14} />;
    }
  };

  const progressWidth = Math.min(Math.max(budget.percentage, 0), 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header: Icono, Nombre y Acciones */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {/* 👇 Icono Visual de la Categoría */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: budget.categoryColor || '#cbd5e1' }}
          >
            <IconComponent size={18} />
          </div>

          <div>
            <h3 className="font-bold text-gray-800 text-lg leading-tight">
              {budget.categoryName}
            </h3>
            {/* Badge de Estado */}
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 border ${getStatusColor()}`}
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
        </div>

        {/* Botones de acción */}
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Barra de Progreso */}
      <div className="space-y-2 mt-1">
        <div className="flex justify-between text-sm font-medium text-gray-600">
          <span
            className={
              budget.status === 'EXCEEDED' ? 'text-red-600 font-bold' : ''
            }
          >
            {budget.percentage}%
          </span>
          <span className="text-xs text-gray-500 mt-1">
            {budget.remaining < 0
              ? `Te pasaste por ${formatCurrency(Math.abs(budget.remaining))}`
              : `${formatCurrency(budget.remaining)} disponibles`}
          </span>
        </div>

        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
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
          <span
            className={`font-semibold ${budget.status === 'EXCEEDED' ? 'text-red-600' : 'text-gray-800'}`}
          >
            {formatCurrency(budget.spent)}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-400 text-xs">Presupuesto</span>
          <span className="font-bold text-gray-900">
            {formatCurrency(budget.amount)}
          </span>
        </div>
      </div>
    </div>
  );
};
