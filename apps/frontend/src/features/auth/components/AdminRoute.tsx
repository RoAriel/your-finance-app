import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 👈 Usamos tu hook actual
import { UserRole } from '@/features/auth/types'; // 👈 Importamos el enum de roles

export const AdminRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth(); // Asumo que tienes un isLoading

  // 1. Si todavía está cargando la sesión, mostramos nada o un spinner
  if (isLoading) return <div className="p-10">Cargando permisos...</div>;

  // 2. Si no está logueado -> Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // 3. Si está logueado pero NO es admin -> Dashboard (Protección)
  if (user.role !== UserRole.ADMIN) {
    return <Navigate to="/" replace />;
  }

  // 4. Si es Admin -> Renderiza la ruta hija
  return <Outlet />;
};
