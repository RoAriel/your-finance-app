import { Edit2, Lock, HelpCircle, Trash2, CornerDownRight } from 'lucide-react';
import type { Category } from '../types';
import { CategoryType } from '../types';
import { ICON_MAP } from '../constants';

interface Props {
  category: Category;
  // 👇 1. Recibimos el nombre del padre (puede ser null)
  parentName?: string | null;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export const CategoryCard = ({
  category,
  parentName,
  onEdit,
  onDelete,
}: Props) => {
  const IconComponent = ICON_MAP[category.icon || 'Home'] || HelpCircle;
  const color = category.color || '#cbd5e1';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
      {/* Lado Izquierdo: Icono y Nombre */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm shrink-0"
          style={{ backgroundColor: color }}
        >
          <IconComponent size={20} />
        </div>

        {/* Contenedor de texto */}
        <div className="overflow-hidden flex flex-col justify-center">
          <h3
            className="font-bold text-gray-800 text-sm leading-tight line-clamp-1"
            title={category.name}
          >
            {category.name}
          </h3>

          {/* 👇 2. Sección del Padre (Solo se renderiza si es hijo) */}
          {parentName && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <CornerDownRight size={12} className="opacity-50" />
              <span className="bg-gray-50 px-1.5 py-0.5 rounded text-gray-600 truncate max-w-[120px]">
                {parentName}
              </span>
            </div>
          )}

          {/* Badges / Etiquetas */}
          <div className="flex items-center gap-2 text-xs mt-1.5 flex-wrap">
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

            {category.isFixed && (
              <span className="flex items-center gap-1 text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                <Lock size={10} /> Fijo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-1 shrink-0 ml-4">
        <button
          onClick={() => onEdit(category)}
          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
          title="Editar"
        >
          <Edit2 size={18} />
        </button>

        <button
          onClick={() => onDelete(category.id)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
