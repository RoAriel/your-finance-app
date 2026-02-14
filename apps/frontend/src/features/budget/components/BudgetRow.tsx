import { useState, createElement } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import type { Budget } from '../services/budgets.service';
import { iconMap } from '@/components/common/icons';
import { formatCurrency } from '@/utils/formatters';

interface Props {
  budget: Budget;
  level?: number;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export const BudgetRow = ({ budget, level = 0, onEdit, onDelete }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false); // Inicia colapsado
  const hasChildren = budget.children && budget.children.length > 0;

  // Resolvemos icono
  const IconComponent = iconMap[budget.categoryIcon] || iconMap['Wallet'];

  // Color de barra según estado
  const getProgressColor = () => {
    if (budget.status === 'EXCEEDED') return 'bg-red-500';
    if (budget.status === 'WARNING') return 'bg-yellow-400';
    return 'bg-green-500';
  };

  // Sangría dinámica según el nivel de profundidad
  const paddingLeft = `${level * 1.5 + 1}rem`;

  return (
    <div className="flex flex-col">
      {/* --- Fila Principal --- */}
      <div
        className={`flex items-center gap-3 p-3 border-b border-gray-100 transition-colors hover:bg-gray-50 
        ${level > 0 ? 'bg-gray-50/30' : 'bg-white'}`}
        style={{ paddingLeft }}
      >
        {/* Botón Expander (Solo si hay hijos) */}
        <div className="w-5 shrink-0 flex justify-center">
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>
          )}
        </div>

        {/* Icono Categoría */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm"
          style={{ backgroundColor: budget.categoryColor || '#9ca3af' }}
        >
          {createElement(IconComponent, { size: 16 })}
        </div>

        {/* Info Central */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-1">
            <h4
              className={`text-sm font-medium ${level === 0 ? 'text-gray-900' : 'text-gray-700'}`}
            >
              {budget.categoryName}
            </h4>
            <div className="text-xs font-mono text-gray-600 flex gap-1">
              <span
                className={
                  budget.status === 'EXCEEDED' ? 'text-red-600 font-bold' : ''
                }
              >
                {formatCurrency(budget.spent)}
              </span>
              <span className="text-gray-400">/</span>
              <span>
                {budget.amount > 0
                  ? formatCurrency(budget.amount)
                  : 'Sin límite'}
              </span>
            </div>
          </div>

          {/* Barra de Progreso */}
          {budget.amount > 0 && (
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Botones de Acción (Ocultos hasta hover para limpieza visual) */}
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:hover:opacity-100 transition-opacity px-2">
          {budget.id && ( // Solo mostramos acciones si existe el presupuesto (id)
            <>
              <button
                onClick={() => onEdit(budget)}
                className="p-1.5 text-gray-400 hover:text-blue-600"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => budget.id && onDelete(budget.id)}
                className="p-1.5 text-gray-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* --- Renderizado Recursivo de Hijos --- */}
      {isExpanded && hasChildren && (
        <div className="border-l-2 border-gray-100 ml-4">
          {' '}
          {/* Línea guía visual */}
          {budget.children.map((child) => (
            <BudgetRow
              key={child.categoryId}
              budget={child}
              level={level + 1} // 👈 Aumentamos nivel
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
