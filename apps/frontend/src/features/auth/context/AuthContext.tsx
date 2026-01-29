/* eslint-disable react-refresh/only-export-components */
// 👆 1. Agregamos esta línea para silenciar el error de Fast Refresh

import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { LoginCredentials, RegisterDto, User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>; // 👈 NUEVO MÉTODO
  logout: () => void;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

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
    const response = await authService.login(credentials);
    setIsAuthenticated(true);

    setUser(response.user); // 👇 Usamos el usuario real que devuelve el back
    navigate('/dashboard');
  };

  const register = async (data: RegisterDto) => {
    // 1. Llama al servicio (que crea user y guarda token en localStorage)
    const response = await authService.register(data);

    // 2. Actualiza el estado GLOBAL de React
    setIsAuthenticated(true);
    setUser(response.user);

    // 3. Redirige
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
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};
