// 👇 1. IMPORTANTE: Traemos el Enum (La nueva fuente de verdad)
import { CategoryType } from '../categories/types';

// 1. Definimos la Categoría anidada
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
  type: CategoryType;

  amount: string; // El backend manda string (Decimal de Prisma)
  currency: string;
  description: string;
  date: string; // ISO String
  categoryId: string;
  category?: TransactionCategory;
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
  type: CategoryType;
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
