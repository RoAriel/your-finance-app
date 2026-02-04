import type { Category } from '../features/categories/types'; // Asegura la ruta correcta

// Extendemos la interfaz base para agregarle hijos
export interface CategoryNode extends Category {
  children: CategoryNode[];
}

export const buildCategoryTree = (categories: Category[]): CategoryNode[] => {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  // 1. Inicializar nodos con array de hijos vacío
  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [] });
  });

  // 2. Conectar padres e hijos
  categories.forEach((cat) => {
    const node = map.get(cat.id);
    if (!node) return;

    if (cat.parentId) {
      const parent = map.get(cat.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // Caso borde: Tiene parentId pero el padre no vino en la lista (huérfano)
        // Lo tratamos como raíz por seguridad visual
        roots.push(node);
      }
    } else {
      roots.push(node); // Es una categoría raíz
    }
  });

  return roots;
};
