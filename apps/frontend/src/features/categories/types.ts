// 1. Definimos el ENUM (Mejor que un type simple para validaciones)
export const CategoryType = {
  INCOME: 'income',
  EXPENSE: 'expense',
  BOTH: 'both',
} as const;

export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];

// 2. La Entidad (Tal como viene de la Base de Datos)
export interface Category {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  isFixed: boolean; // true = Gasto Fijo
  color?: string; // Opcional (?) porque en Prisma es String?
  icon?: string; // Opcional (?) porque en Prisma es String?
}

// 3. DTO para Crear (Lo que envía el formulario)
export interface CreateCategoryDTO {
  name: string;
  type: CategoryType;
  isFixed?: boolean; // Opcional al crear (default false en back)
  color?: string;
  icon?: string;
}

// 4. DTO para Actualizar (Partial del Create)
export type UpdateCategoryDTO = Partial<CreateCategoryDTO>;
