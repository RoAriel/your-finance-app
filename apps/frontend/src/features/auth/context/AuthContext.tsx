/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { LoginCredentials, RegisterDto, User } from '../types';
import { usersService } from '../../users/services/users.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  updateLocalUser: (userData: Partial<User>) => void;
  loginWithToken: (token: string) => Promise<void>;
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

  const loginWithToken = async (token: string) => {
    try {
      // 1. Guardamos token
      localStorage.setItem('token', token);
      setIsAuthenticated(true);

      // 2. Buscamos info del usuario (porque el token no tiene el avatar/nombre actualizado)
      const userProfile = await usersService.getProfile();
      setUser(userProfile);

      // 3. Redirigimos
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al obtener perfil con token social', error);
      logout(); // Si falla, limpiamos todo
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        register,
        updateLocalUser,
        loginWithToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
