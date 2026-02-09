import { useLocation, Link } from 'react-router-dom'; // 👈 1. Importamos Link
import { Menu } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface TopBarProps {
  toggleSidebar: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Panel de Control',
  '/transactions': 'Movimientos',
  '/categories': 'Categorías',
  '/budgets': 'Presupuestos',
  '/savings': 'Mis Cuentas',
  '/profile': 'Mi Perfil',
};

export const TopBar = ({ toggleSidebar }: TopBarProps) => {
  const { user } = useAuth();
  const location = useLocation();

  const currentTitle = PAGE_TITLES[location.pathname] || 'Your Finance';

  // Helpers para nombres
  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`
    : 'Usuario';

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'US';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 shadow-sm">
      {/* IZQUIERDA */}
      <div className="flex items-center gap-4">
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
          <span className="text-xs text-gray-400 md:hidden">
            Your Finance / {currentTitle}
          </span>
        </div>
      </div>

      {/* DERECHA */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-700">{displayName}</p>
          <p className="text-xs text-gray-500">Cuenta Gratuita</p>
        </div>

        {/* 👇 2. AQUÍ EL CAMBIO: Envolvemos todo el avatar en un Link */}
        <Link to="/profile" title="Ir a mi perfil">
          <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm ring-2 ring-white shadow-sm cursor-pointer hover:bg-primary/20 transition-colors overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};
