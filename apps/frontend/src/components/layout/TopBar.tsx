import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface TopBarProps {
  toggleSidebar: () => void;
}

// Mapa de títulos según la URL
const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Panel de Control',
  '/transactions': 'Movimientos',
  '/categories': 'Categorías',
  '/budgets': 'Presupuestos',
  '/savings': 'Mis Cuentas',
};

export const TopBar = ({ toggleSidebar }: TopBarProps) => {
  const { user } = useAuth();
  const location = useLocation();

  // Determinamos el título, o un default si es una sub-ruta
  const currentTitle = PAGE_TITLES[location.pathname] || 'Your Finance';

  // Iniciales del usuario para el avatar
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'US';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 shadow-sm">
      {/* IZQUIERDA: Toggle Móvil + Título */}
      <div className="flex items-center gap-4">
        {/* Botón hamburguesa solo visible en Mobile */}
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg md:hidden"
        >
          <Menu size={24} />
        </button>

        <div>
          <h1 className="text-xl font-bold text-gray-800 hidden md:block">
            {currentTitle}
          </h1>
          {/* Breadcrumb visual simple */}
          <span className="text-xs text-gray-400 md:hidden">
            Your Finance / {currentTitle}
          </span>
        </div>
      </div>

      {/* DERECHA: Perfil de Usuario */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-700">{user?.name}</p>
          <p className="text-xs text-gray-500">Cuenta Gratuita</p>
        </div>

        <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm ring-2 ring-white shadow-sm cursor-pointer hover:bg-primary/20 transition-colors">
          {initials}
        </div>
      </div>
    </header>
  );
};
