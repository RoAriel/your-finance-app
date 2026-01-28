export interface SavingsGoal {
  id: string;
  name: string;
  balance: number; // Cuánto tengo
  targetAmount?: number; // Cuánto quiero (Opcional)
  targetDate?: string; // Para cuándo (Opcional)
  progress?: number; // % Calculado por backend (0-100)
  color?: string; // Hex: #FF5733
  currency: string; // ARS, USD
}

export interface CreateSavingsDto {
  name: string;
  targetAmount?: number;
  targetDate?: string;
  color?: string;
  currency?: string;
}

export interface DepositDto {
  amount: number;
  description?: string; // Opcional, por si quieres guardar el motivo
}
export interface TransferDto {
  sourceAccountId: string;
  targetAccountId: string;
  amount: number;
  description?: string;
}
