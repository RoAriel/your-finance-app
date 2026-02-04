// 1. Definimos el ENUM (Mejor que un type simple para validaciones)
export const CategoryType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
  BOTH: 'BOTH',
} as const;

export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];

// 2. La Entidad (Tal como viene de la Base de Datos)
export interface Category {
  id: string;
  name: string;
  type: CategoryType; // 👈 Ya no es string, es el Enum
  color: string;
  icon: string;
  isFixed: boolean;
  parentId: string | null;
  userId: string;
}

// 3. DTO para Crear (Lo que envía el formulario)
export interface CreateCategoryDTO {
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  parentId?: string | null;
}
// 4. DTO para Actualizar (Partial del Create)
export type UpdateCategoryDTO = Partial<CreateCategoryDTO>;
