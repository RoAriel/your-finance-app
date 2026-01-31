// Definimos los tipos de cuenta como constantes para evitar "magic strings"
export const AccountType = {
  WALLET: 'WALLET',
  SAVINGS: 'SAVINGS',
  INVESTMENT: 'INVESTMENT',
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export interface Account {
  id: string;
  userId: string;
  name: string;
  balance: number; // El backend calcula esto
  targetAmount?: number; // Solo para cuentas de ahorro
  currency: 'ARS' | 'USD' | 'EUR'; // Ajustado a tu modelo
  type: AccountType;
  isDefault: boolean;
  color?: string;
  icon?: string;
}

export interface CreateAccountDTO {
  name: string;
  type: AccountType;
  currency: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
}

export type UpdateAccountDTO = Partial<CreateAccountDTO>;
