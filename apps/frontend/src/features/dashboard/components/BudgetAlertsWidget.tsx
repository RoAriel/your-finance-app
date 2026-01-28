import { Link } from 'react-router-dom';
import { AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';
import { useBudgets } from '../../budget/hooks/useBudgets'; // Ajusta la ruta a tu hook real

interface Props {
  month: number;
  year: number;
}

export const BudgetAlertsWidget = ({ month, year }: Props) => {
  const { budgets, isLoading } = useBudgets(month, year);

  // 1. Filtramos: Solo mostramos lo que esté en PELIGRO (>100%) o ADVERTENCIA (>80%)
  const alerts = (budgets || [])
    .filter((b) => b.percentage >= 80)
    .sort((a, b) => b.percentage - a.percentage) // Ordenamos: Lo más crítico primero
    .slice(0, 3); // Solo mostramos el top 3 para no saturar

  // 2. Si no carga o no hay alertas, no mostramos nada (Componente Invisible)
  if (isLoading || alerts.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
      <div className="p-4 bg-orange-50/50 border-b border-orange-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <AlertTriangle size={18} className="text-orange-500" />
          Alertas de Presupuesto
        </h3>
        <Link
          to="/budgets"
          className="text-xs font-medium text-orange-600 hover:text-orange-800 flex items-center gap-1"
        >
          Gestionar <ArrowRight size={14} />
        </Link>
      </div>

      <div className="divide-y divide-gray-50">
        {alerts.map((budget) => {
          const isExceeded = budget.percentage > 100;

          return (
            <div
              key={budget.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  {isExceeded ? (
                    <AlertCircle size={16} className="text-red-500" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  )}
                  <span className="font-medium text-sm text-gray-700">
                    {budget.categoryName}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold ${isExceeded ? 'text-red-600' : 'text-yellow-600'}`}
                >
                  {isExceeded ? 'Excedido' : 'En riesgo'} ({budget.percentage}%)
                </span>
              </div>

              {/* Barra de progreso mini */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isExceeded ? 'bg-red-500' : 'bg-yellow-400'}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>

              <div className="flex justify-between mt-1 text-xs text-gray-400">
                <span>Gastado: ${budget.spent.toLocaleString()}</span>
                <span>Límite: ${budget.amount.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
