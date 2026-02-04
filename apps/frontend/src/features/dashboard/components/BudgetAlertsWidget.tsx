import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { useBudgets } from '../../budget/hooks/useBudgets';
import { formatCurrency } from '../../../utils/formatters';
// 👇 1. Importamos el mapa de iconos
import { ICON_MAP } from '../../categories/constants';

interface Props {
  month: number;
  year: number;
}

export const BudgetAlertsWidget = ({ month, year }: Props) => {
  const { budgets, isLoading } = useBudgets(month, year);

  // Filtro: Solo mostrar WARNING (>80%) o EXCEEDED (>100%)
  const alerts = (budgets || [])
    .filter((b) => b.percentage >= 80)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 3);

  // Si no hay alertas, ocultamos el widget
  if (isLoading || alerts.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="p-4 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-base">
          <AlertTriangle size={18} className="text-orange-500" />
          Alertas de Presupuesto
        </h3>
        <Link
          to="/budgets"
          className="text-xs font-medium text-orange-600 hover:text-orange-800 flex items-center gap-1 transition-colors"
        >
          Gestionar <ArrowRight size={14} />
        </Link>
      </div>

      <div className="divide-y divide-gray-50">
        {alerts.map((budget) => {
          const isExceeded = budget.percentage > 100;

          // 👇 2. Resolvemos el Icono Visual
          const IconComp = ICON_MAP[budget.categoryIcon] || HelpCircle;
          const color = budget.categoryColor || '#cbd5e1';

          return (
            <div
              key={budget.id}
              className="p-4 hover:bg-orange-50/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  {/* Icono de la Categoría */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    <IconComp size={14} />
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-sm text-gray-800">
                        {budget.categoryName}
                      </span>
                      {/* Icono de estado pequeño */}
                      {isExceeded && (
                        <AlertCircle size={14} className="text-red-500" />
                      )}
                    </div>
                    <p
                      className={`text-xs font-bold ${isExceeded ? 'text-red-600' : 'text-yellow-600'}`}
                    >
                      {isExceeded
                        ? 'Has excedido el límite'
                        : 'Cerca del límite'}{' '}
                      ({budget.percentage}%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Barra de progreso mini */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isExceeded ? 'bg-red-500' : 'bg-yellow-400'
                  }`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>

              {/* Montos formateados */}
              <div className="flex justify-between mt-1.5 text-xs text-gray-400">
                <span>
                  Gastado:{' '}
                  <span className="text-gray-600 font-medium">
                    {formatCurrency(budget.spent)}
                  </span>
                </span>
                <span>
                  Límite:{' '}
                  <span className="text-gray-600 font-medium">
                    {formatCurrency(budget.amount)}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
