/* eslint-disable react-refresh/only-export-components */
// 👆 1. Agregamos esta línea para silenciar el error de Fast Refresh

import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { LoginCredentials } from '../types';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Inicializamos leyendo el token directamente
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('token')
  );

  const navigate = useNavigate();
  // Eliminamos useLocation porque ya no lo necesitamos aquí

  const login = async (credentials: LoginCredentials) => {
    // 👇 2. Corregido: Llamamos al servicio sin guardar 'const response ='
    await authService.login(credentials);

    setIsAuthenticated(true);
    setUser({ email: credentials.email });

    navigate('/dashboard');
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  // 3. 🗑️ ELIMINADO el useEffect que causaba 'Cascading Renders'.
  // La seguridad la maneja 'ProtectedRoute.tsx', no este archivo.

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
