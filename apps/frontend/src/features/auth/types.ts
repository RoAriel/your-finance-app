// apps/frontend/src/features/auth/types.ts

export interface User {
  email: string;
  name: string;
  currency: string;
}

export interface AuthResponse {
  access_token: string;
  // Si tu backend devuelve el usuario junto con el token, agrégalo aquí.
  // Si no, tendremos que hacer un fetchUser profile después.
  // Por ahora asumo que solo devuelve el token según tu docs.
}

export interface LoginCredentials {
  email: string;
  password: string;
}