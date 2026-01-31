// 1. Definimos la Categoría anidada (solo lo que vemos en el JSON)
export interface TransactionCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  isFixed: boolean;
}

// 2. Definimos la Transacción
export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense' | 'bouth' | 'transfer';
  amount: string; // ¡OJO! El backend lo manda como string
  currency: string;
  description: string;
  date: string; // ISO String ("2026-01-18T...")
  categoryId: string;
  category?: TransactionCategory; // Puede venir o no, según el backend
  accountId: string;
  createdAt: string;
}

// 3. Definimos la Paginación (meta)
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// 4. La respuesta completa de la API
export interface TransactionsResponse {
  data: Transaction[];
  meta: PaginationMeta;
}

export interface BalanceResponse {
  income: number;
  expenses: number;
  balance: number;
}

export interface CreateTransactionDTO {
  amount: number;
  description: string;
  categoryId: string;
  accountId: string; // 👈 AGREGADO: Campo obligatorio en el nuevo modelo
  date: string;
  type: 'income' | 'expense';
  currency: string;
}
// 6. Filtros para la consulta
export interface TransactionFilters {
  month?: number; // 1-12
  year?: number; // 2026
  page?: number;
  limit?: number;
}
// Partial hace que todos los campos de Create sean opcionales
export type UpdateTransactionDTO = Partial<CreateTransactionDTO>;
