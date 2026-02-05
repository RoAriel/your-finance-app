export interface UserPayload {
  id: string;
  email: string;
  firstName?: string; // Opcional porque viene del token decoded a veces
  lastName?: string;
}
