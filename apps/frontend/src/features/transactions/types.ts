import { CategoryType } from '../categories/types';
import type { Category } from '../categories/types';
import type { Account } from '../accounts/types';

export const TransactionType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
  TRANSFER: 'TRANSFER',
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
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  accountId: string;
  categoryId?: string;
  currency: string;

  // 👇 AGREGA ESTAS DOS LÍNEAS MÁGICAS:
  account?: Account; // Ahora TypeScript sabe que puede venir el objeto completo
  category?: Category; // Ahora TypeScript sabe que puede venir el objeto completo

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
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
  categoryId?: string;
  accountId: string;
  date: string;
  type: TransactionType;
  currency: string;
  search?: string;
  startDate?: string;
  endDate?: string;
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
