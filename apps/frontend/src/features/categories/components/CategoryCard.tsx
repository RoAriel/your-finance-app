import { Edit2, Lock, HelpCircle, Trash2 } from 'lucide-react';
import type { Category } from '../types';
import { CategoryType } from '../types';
import { ICON_MAP } from '../constants';

interface Props {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export const CategoryCard = ({ category, onEdit, onDelete }: Props) => {
  const IconComponent = ICON_MAP[category.icon || 'Home'] || HelpCircle;
  const color = category.color || '#cbd5e1';

  return (
    // 1. Eliminamos la clase 'group' ya que no la necesitamos para el hover
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
      {/* Lado Izquierdo: Icono y Nombre */}
      {/* 2. Usamos 'flex-1' y 'min-w-0' para que esta sección sea flexible y no desborde */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div
          // 3. 'shrink-0' evita que el círculo del icono se aplaste
          className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm shrink-0"
          style={{ backgroundColor: color }}
        >
          <IconComponent size={20} />
        </div>

        {/* Contenedor de texto con 'overflow-hidden' para que funcione el truncate */}
        <div className="overflow-hidden">
          {/* 4. 'truncate' corta el texto con '...' si es muy largo */}
          <h3
            className="font-bold text-gray-800 text-sm leading-tight line-clamp-2"
            title={category.name}
          >
            {category.name}
          </h3>

          {/* 5. 'flex-wrap' permite que los badges bajen de línea si no caben */}
          <div className="flex items-center gap-2 text-xs mt-1 flex-wrap">
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
              // 6. 'shrink-0' asegura que el badge de Fijo no se rompa
              <span className="flex items-center gap-1 text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                <Lock size={10} /> Fijo
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      {/* 7. Eliminamos 'opacity-0' y 'group-hover'. Agregamos 'shrink-0' y un margen izquierdo 'ml-4' */}
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
