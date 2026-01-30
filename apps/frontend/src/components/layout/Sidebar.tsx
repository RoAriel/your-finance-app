import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  LogOut,
  Tags,
  Wallet,
  HandCoins,
  ChevronLeft,
  ChevronRight,
  //Menu,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const Sidebar = ({ isCollapsed, toggleCollapse }: SidebarProps) => {
  const { logout } = useAuth();

  const navLinks = [
    {
      to: '/dashboard',
      text: 'Dashboard',
      icon: <LayoutDashboard size={22} />,
    },
    { to: '/transactions', text: 'Movimientos', icon: <ListTodo size={22} /> },
    { to: '/savings', text: 'Mis Cuentas', icon: <HandCoins size={22} /> }, // Subido por prioridad
    { to: '/budgets', text: 'Presupuestos', icon: <Wallet size={22} /> },
    { to: '/categories', text: 'Categorías', icon: <Tags size={22} /> },
  ];

  return (
    <aside
      className={`
        h-screen bg-slate-900 text-white flex flex-col transition-all duration-300 sticky top-0 z-20 shadow-xl
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* 1. LOGO & TOGGLE */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 relative">
        {/* Logo: Se oculta si colapsa */}
        {!isCollapsed && (
          <h2 className="text-xl font-bold tracking-wide text-white">
            Your<span className="text-primary">Finance</span>
          </h2>
        )}

        {/* Logo versión mini */}
        {isCollapsed && (
          <div className="w-full flex justify-center font-bold text-primary text-xl">
            YF
          </div>
        )}

        {/* Botón Desktop para colapsar */}
        <button
          onClick={toggleCollapse}
          className="absolute -right-3 top-1/2 -translate-y-1/2 bg-primary text-white p-1 rounded-full shadow-lg hover:bg-primary-hover hidden md:flex transition-transform"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* 2. NAVEGACIÓN */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative
              ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <span className="shrink-0">{link.icon}</span>

            {/* Texto con transición de opacidad */}
            <span
              className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}
            >
              {link.text}
            </span>

            {/* Tooltip flotante (Solo cuando está colapsado) */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-slate-700">
                {link.text}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 3. FOOTER */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className={`
            flex items-center gap-3 w-full px-3 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title="Cerrar Sesión"
        >
          <LogOut size={22} className="shrink-0" />
          {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};
