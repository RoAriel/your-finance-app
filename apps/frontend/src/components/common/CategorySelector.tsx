import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { useCategories } from '../../features/categories/hooks/useCategories';
import { CategoryType } from '../../features/categories/types';
import { buildCategoryTree } from '../../utils/category-tree';
import type { CategoryNode } from '../../utils/category-tree';

interface Props {
  value: string;
  onChange: (value: string) => void;
  type: CategoryType;
  placeholder?: string;
  className?: string;
  excludeId?: string;
  disabled?: boolean;
}

export const CategorySelector = ({
  value,
  onChange,
  type,
  placeholder = 'Selecciona una categoría...',
  className = '',
  excludeId,
  disabled = false,
}: Props) => {
  const { categories, isLoading } = useCategories(type);

  const tree = useMemo(() => {
    if (!categories) return [];

    let filtered = categories.filter((cat) => {
      const catType = cat.type;
      return catType === type || catType === CategoryType.BOTH;
    });

    if (excludeId) {
      filtered = filtered.filter((c) => c.id !== excludeId);
    }

    return buildCategoryTree(filtered);
  }, [categories, type, excludeId]);

  const renderOptions = (
    nodes: CategoryNode[],
    level = 0
  ): React.ReactNode[] => {
    return nodes
      .map((node) => {
        // 🎨 MEJORA VISUAL AQUÍ:
        // Usamos espacios en blanco reales (\u00A0) para empujar el texto.
        // Si es hijo (level > 0), ponemos una flecha curva suave '↳'
        const indent = '\u00A0\u00A0\u00A0'.repeat(level);
        const symbol = level > 0 ? '↳ ' : '';

        // Nota: Eliminamos {node.icon} para que no imprima el texto "shopping-cart"
        const label = `${indent}${symbol}${node.name}`;

        return [
          <option key={node.id} value={node.id}>
            {label}
          </option>,
          ...(node.children.length > 0
            ? renderOptions(node.children, level + 1)
            : []),
        ];
      })
      .flat();
  };

  if (isLoading) {
    return (
      <div className="animate-pulse h-10 bg-gray-100 rounded-lg w-full border border-gray-200"></div>
    );
  }

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm rounded-lg appearance-none bg-white truncate cursor-pointer ${className} ${disabled ? 'bg-gray-100 text-gray-400' : 'text-gray-700'}`}
      >
        <option value="">{placeholder}</option>
        {renderOptions(tree)}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <ChevronRight size={16} className="rotate-90" />
      </div>
    </div>
  );
};
