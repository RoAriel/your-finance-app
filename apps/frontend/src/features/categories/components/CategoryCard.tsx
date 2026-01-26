import { Edit2, Lock, HelpCircle } from 'lucide-react';
import type { Category } from '../types';
import { CategoryType } from '../types';
import { ICON_MAP } from '../constants';

interface Props {
  category: Category;
  onEdit: (category: Category) => void;
}

export const CategoryCard = ({ category, onEdit }: Props) => {
  // 1. Resolvemos el Icono (Si no existe, usamos HelpCircle)
  const IconComponent = ICON_MAP[category.icon || 'Home'] || HelpCircle;

  // 2. Color de fondo (Si no tiene, usamos gris)
  const color = category.color || '#cbd5e1';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 flex items-center justify-between group">
      {/* Lado Izquierdo: Icono y Nombre */}
      <div className="flex items-center gap-4">
        {/* Círculo de Color con Icono */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm"
          style={{ backgroundColor: color }}
        >
          <IconComponent size={20} />
        </div>

        <div>
          <h3 className="font-bold text-gray-800">{category.name}</h3>

          <div className="flex items-center gap-2 text-xs mt-1">
            {/* Badge de Tipo */}
            <span
              className={`px-2 py-0.5 rounded-full font-medium ${
                category.type === CategoryType.INCOME
                  ? 'bg-green-100 text-green-700'
                  : category.type === CategoryType.EXPENSE
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
              }`}
            >
              {category.type === CategoryType.INCOME
                ? 'Ingreso'
                : category.type === CategoryType.EXPENSE
                  ? 'Gasto'
                  : 'Ambos'}
            </span>

            {/* Icono de Fijo */}
            {category.isFixed && (
              <span className="flex items-center gap-1 text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                <Lock size={10} /> Fijo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botón Editar (Solo aparece al pasar el mouse - group-hover) */}
      <button
        onClick={() => onEdit(category)}
        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
        title="Editar"
      >
        <Edit2 size={18} />
      </button>
    </div>
  );
};
