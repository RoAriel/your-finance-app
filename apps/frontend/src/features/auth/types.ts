// apps/frontend/src/features/auth/types.ts

export interface User {
  email: string;
  name: string;
  currency: string;
  id: string;
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
  name: string;
  email: string;
  password: string;
  currency?: string;
}
