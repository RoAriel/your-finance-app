import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import { LoginPage } from './features/auth/pages/LoginPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { TransactionsPage } from './features/transactions/pages/TransactionsPage';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { CategoriesPage } from './features/categories/pages/CategoriesPage';
import { ConfirmProvider } from './context/ConfirmContext';
import { BudgetsPage } from './features/budget/pages/BudgetsPage';
import { SavingsPage } from './features/savings/pages/SavingsPage';
import { RegisterPage } from './features/auth/pages/RegisterPage';
import { MainLayout } from './layouts/MainLayout';

function App() {
  return (
    // 1. Envolvemos todo con el ConfirmProvider
    <BrowserRouter>
      <ConfirmProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/categories" element={<CategoriesPage />} />

                {/* Rutas Hijas */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/budgets" element={<BudgetsPage />} />
                <Route path="/savings" element={<SavingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </AuthProvider>
      </ConfirmProvider>
    </BrowserRouter>
  );
}

export default App;
