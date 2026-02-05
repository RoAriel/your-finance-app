/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { LoginCredentials, RegisterDto, User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  // 👇 Esto permite actualizar el nombre en la Sidebar sin recargar la página
  updateLocalUser: (userData: Partial<User>) => void;
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

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    setIsAuthenticated(true);
    setUser(response.user);
    navigate('/dashboard');
  };

  const register = async (data: RegisterDto) => {
    const response = await authService.register(data);
    setIsAuthenticated(true);
    setUser(response.user);
    navigate('/dashboard');
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  // 👇 NUEVA FUNCIÓN: Actualiza el estado local mezclando lo nuevo con lo viejo
  const updateLocalUser = (userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        register,
        updateLocalUser, // 👈 Importante: Exponemos la función aquí
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
