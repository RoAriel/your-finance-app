import { CategoryType } from '../categories/types';

export const TransactionType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
  TRANSFER_IN: 'transfer_in',
  TRANSFER_OUT: 'transfer_out',
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

// 1. Definimos la Categoría anidada
export interface TransactionCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  isFixed: boolean;
  type: CategoryType;
}

// 2. Definimos la Transacción
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;

  amount: string; // El backend manda string (Decimal de Prisma)
  currency: string;
  description: string;
  date: string; // ISO String
  categoryId?: string | null;
  category?: TransactionCategory | null;
  accountId: string;
  createdAt: string;
}

// 3. Paginación (Sin cambios)
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// 4. Respuesta API (Sin cambios)
export interface TransactionsResponse {
  data: Transaction[];
  meta: PaginationMeta;
}

// 5. Balance (Sin cambios)
export interface BalanceResponse {
  income: number;
  expenses: number;
  balance: number;
}

// 6. DTO de Creación
export interface CreateTransactionDTO {
  amount: number; // Aquí el form usa number
  description: string;
  categoryId: string;
  accountId: string;
  date: string;
  type: TransactionType;
  currency: string;
}

// 7. Filtros
export interface TransactionFilters {
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}

// 8. Update DTO
export type UpdateTransactionDTO = Partial<CreateTransactionDTO>;
