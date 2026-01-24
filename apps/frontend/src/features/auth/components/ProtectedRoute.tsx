import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  // Verificamos si existe el token en el almacenamiento
  // OJO: En una app real, aquí verificaríamos si el token no ha expirado
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    // Si no tiene pase, lo mandamos a la entrada (replace evita que pueda volver atrás)
    return <Navigate to="/login" replace />;
  }

  // Si tiene pase, renderizamos el contenido hijo (Outlet)
  return <Outlet />;
};