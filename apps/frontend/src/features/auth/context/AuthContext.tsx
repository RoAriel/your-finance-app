/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Quitamos useLocation
import { authService } from '../services/auth.service';
import type { LoginCredentials, RegisterDto, User } from '../types';
import { usersService } from '../../users/services/users.service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  // 🗑️ Eliminamos const location = useLocation();

  // 1. Restaurar sesión al hacer F5
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsAuthenticated(true);
        const userProfile = await usersService.getProfile();
        setUser(userProfile);
      } catch (error) {
        console.error('Error restaurando sesión:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);

    if (response.token) {
      localStorage.setItem('token', response.token);
    }

    setIsAuthenticated(true);
    setUser(response.user);
    navigate('/dashboard');
  };

  const register = async (data: RegisterDto) => {
    const response = await authService.register(data);

    if (response.token) {
      localStorage.setItem('token', response.token);
    }

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

  const updateLocalUser = (userData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  };

  const loginWithToken = async (token: string) => {
    try {
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      const userProfile = await usersService.getProfile();
      setUser(userProfile);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error login social:', error);
      logout();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-primary font-semibold">
          Cargando Your Finance...
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
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
