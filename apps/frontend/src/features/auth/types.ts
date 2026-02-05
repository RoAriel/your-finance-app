// apps/frontend/src/features/auth/types.ts

export interface User {
  id: string;
  email: string;
  firstName: string; // 👈 Reemplaza a 'name'
  lastName: string; // 👈 Nuevo
  currency: string;
  avatarUrl?: string;
  // timezone, language, role, etc. pueden agregarse aquí
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  currency?: string;
}
