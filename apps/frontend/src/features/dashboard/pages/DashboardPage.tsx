// apps/frontend/src/features/dashboard/pages/DashboardPage.tsx
import { authService } from '../../auth/services/auth.service';

export const DashboardPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <p className="text-gray-600 mb-4">
          ¡Has ingresado correctamente al área privada! 🎉
        </p>
        <button
          onClick={() => authService.logout()}
          className="px-4 py-2 bg-danger text-white rounded hover:opacity-90 transition-opacity cursor-pointer font-medium shadow-sm"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};
