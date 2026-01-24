import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública: Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Protegidas (Grupo) */}
        <Route element={<ProtectedRoute />}>
          {/* Si entra a la raíz, redirigir al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={<DashboardPage />} />
          {/* Aquí agregaremos más rutas: /transactions, /budget, etc. */}
        </Route>

        {/* Catch-all: Si escribe cualquier fruta, volver al login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;