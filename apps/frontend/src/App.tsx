import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/pages/LoginPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { TransactionsPage } from './features/transactions/pages/TransactionsPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { CategoriesPage } from './features/categories/pages/CategoriesPage';
import { ConfirmProvider } from './context/ConfirmContext';
import { MainLayout } from './layouts/MainLayout';

function App() {
  return (
    // 1. Envolvemos todo con el ConfirmProvider
    <ConfirmProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/categories" element={<CategoriesPage />} />

              {/* Rutas Hijas */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ConfirmProvider>
  );
}

export default App;
