import { useState, createElement } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Ban,
  Plus, // 👈 Agregamos el Plus para indicar "Crear" si está vacío
} from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = budget.children && budget.children.length > 0;

  // Icono
  const IconComponent = iconMap[budget.categoryIcon] || iconMap['Wallet'];

  // Estados visuales
  const getStatusColor = () => {
    if (budget.amount === 0) return 'bg-gray-100 text-gray-500 border-gray-200';
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

  // Indentación inteligente
  const paddingLeft = `${level * 1.5}rem`;

  return (
    <div className="flex flex-col">
      {/* --- FILA PRINCIPAL --- */}
      <div
        className={`group flex items-center gap-3 p-3 sm:p-4 border-b border-gray-100 transition-colors hover:bg-gray-50 
        ${level > 0 ? 'bg-gray-50/40' : 'bg-white'}`}
        style={{
          paddingLeft: level === 0 ? '1rem' : `calc(1rem + ${paddingLeft})`,
        }}
      >
        {/* 1. Botón Expander */}
        <div className="w-5 shrink-0 flex justify-center">
          {hasChildren ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition-all"
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}
        </div>

        {/* 2. Icono */}
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm
          ${budget.amount === 0 && budget.spent === 0 ? 'opacity-60 grayscale' : ''}`}
          style={{ backgroundColor: budget.categoryColor || '#9ca3af' }}
        >
          {createElement(IconComponent, { size: 18 })}
        </div>

        {/* 3. Información */}
        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center">
          {/* Nombre y Badge */}
          <div className="md:col-span-5">
            <h4
              className={`truncate font-medium ${level === 0 ? 'text-gray-900 text-sm sm:text-base' : 'text-gray-700 text-sm'}`}
            >
              {budget.categoryName}
            </h4>

            {/* Badge de Estado */}
            {budget.amount > 0 && (
              <div
                className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor()}`}
              >
                {budget.status === 'EXCEEDED' && <Ban size={10} />}
                {budget.status === 'WARNING' && <AlertTriangle size={10} />}
                {budget.status === 'OK' && <CheckCircle size={10} />}
                <span>{budget.percentage.toFixed(0)}%</span>
              </div>
            )}
          </div>

          {/* Barra y Montos */}
          <div className="md:col-span-7 flex flex-col justify-center gap-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span
                className={
                  budget.status === 'EXCEEDED'
                    ? 'text-red-600 font-bold'
                    : 'text-gray-600'
                }
              >
                {formatCurrency(budget.spent)}
              </span>
              <span className="text-gray-400">
                {budget.amount > 0
                  ? formatCurrency(budget.amount)
                  : 'Sin límite'}
              </span>
            </div>

            {budget.amount > 0 ? (
              <div className="h-1.5 sm:h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor()}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
            ) : (
              // Línea sutil indicando vacío
              <div className="h-1.5 w-full border-b border-gray-100" />
            )}
          </div>
        </div>

        {/* 4. Botones de Acción */}
        <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pl-2">
          {/* BOTÓN EDITAR / CREAR (Siempre visible) */}
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title={budget.id ? 'Editar Presupuesto' : 'Asignar Presupuesto'}
          >
            {budget.id ? <Edit2 size={16} /> : <Plus size={16} />}
          </button>

          {/* BOTÓN BORRAR (Solo si existe) */}
          {budget.id && (
            <button
              onClick={() => onDelete(budget.id!)}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar Límite"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* --- RECURSIVIDAD --- */}
      {isExpanded && hasChildren && (
        <div className="animate-in slide-in-from-top-2 duration-200">
          {budget.children.map((child) => (
            <BudgetRow
              key={child.categoryId}
              budget={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
