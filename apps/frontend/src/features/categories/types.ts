export type CategoryType = 'income' | 'expense' | 'both';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  isFixed: boolean;
}

export interface CategoriesResponse {
  data: Category[];
  meta: {
    total: number;
    // ... otros metadatos que no usaremos por ahora
  };
}
