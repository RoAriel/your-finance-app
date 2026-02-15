import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  LogOut,
  Tags,
  Wallet,
  HandCoins,
  //ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Shield,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { UserRole } from '@/features/auth/types';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

// --- CONSTANTES DE MENÚ ---
const USER_LINKS = [
  { to: '/dashboard', text: 'Dashboard', icon: <LayoutDashboard size={22} /> },
  { to: '/transactions', text: 'Movimientos', icon: <ListTodo size={22} /> },
  { to: '/savings', text: 'Mis Cuentas', icon: <HandCoins size={22} /> },
  { to: '/budgets', text: 'Presupuestos', icon: <Wallet size={22} /> },
  { to: '/categories', text: 'Categorías', icon: <Tags size={22} /> },
  { to: '/profile', text: 'Mi Perfil', icon: <UserIcon size={22} /> },
];

const ADMIN_LINKS = [
  { to: '/admin/users', text: 'Gestión Usuarios', icon: <Users size={22} /> },
];

export const Sidebar = ({ isCollapsed, toggleCollapse }: SidebarProps) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  // Lógica de visualización
  const showFullSidebar = !isCollapsed || isHovered;
  const isAdminSection = location.pathname.startsWith('/admin');
  const navLinks = isAdminSection ? ADMIN_LINKS : USER_LINKS;

  return (
    // 1. WRAPPER "FANTASMA": Reserva el espacio en el layout
    // Si está colapsado, ocupa w-20. Si está fijo, ocupa w-64.
    // Esto evita que el dashboard se mueva cuando haces hover.
    <div
      className={`relative h-screen  top-0 z-20 transition-[width] duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* 2. SIDEBAR REAL: El que se expande y flota */}
      <aside
        onMouseEnter={() => isCollapsed && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          h-full bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out
          
          /* Lógica de Flotación y Sombra */
          ${showFullSidebar ? 'w-64' : 'w-20'}
          ${
            isHovered && isCollapsed
              ? 'absolute top-0 left-0 z-50 shadow-2xl shadow-black/50 border-r border-slate-700'
              : ''
          }
        `}
      >
        {/* --- A. HEADER (Logo & Toggle) --- */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 relative shrink-0">
          {/* Logo Extendido */}
          <div
            className={`overflow-hidden transition-all duration-300 ${showFullSidebar ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}
          >
            <h2 className="text-xl font-bold tracking-wide text-white flex items-center gap-2 whitespace-nowrap">
              {isAdminSection ? (
                <>
                  <Shield className="text-primary" /> Admin
                  <span className="text-primary">Panel</span>
                </>
              ) : (
                <>
                  Your<span className="text-primary">Finance</span>
                </>
              )}
            </h2>
          </div>

          {/* Logo Colapsado (Solo Icono) */}
          {!showFullSidebar && (
            <div className="absolute inset-0 flex items-center justify-center">
              {isAdminSection ? (
                <Shield size={24} className="text-primary" />
              ) : (
                <span className="font-bold text-primary text-xl">YF</span>
              )}
            </div>
          )}

          {/* Botón Pin/Colapsar */}
          <button
            onClick={toggleCollapse}
            className={`
              absolute -right-3 top-1/2 -translate-y-1/2 bg-primary text-white p-1 rounded-full shadow-lg hover:bg-primary-hover hidden md:flex transition-transform z-50
              ${!isCollapsed ? 'rotate-180' : ''}
            `}
            title={isCollapsed ? 'Fijar abierto' : 'Colapsar'}
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* --- B. NAVEGACIÓN (Scrollable) --- */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden whitespace-nowrap
                ${
                  isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
                ${!showFullSidebar ? 'justify-center' : ''}
              `}
            >
              <span className="shrink-0">{link.icon}</span>

              <span
                className={`transition-all duration-300 origin-left ${
                  showFullSidebar
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-5 w-0'
                }`}
              >
                {link.text}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* --- C. BOTONES DE MODO (Admin Only) --- */}
        {user?.role === UserRole.ADMIN && (
          <div className="px-3 pb-2 pt-2 border-t border-slate-800/50 shrink-0">
            {isAdminSection ? (
              <NavLink
                to="/dashboard"
                className={`flex items-center gap-3 px-3 py-3 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-all overflow-hidden whitespace-nowrap ${!showFullSidebar ? 'justify-center' : ''}`}
              >
                <ArrowLeft size={22} className="shrink-0" />
                <span
                  className={`transition-all duration-300 ${showFullSidebar ? 'opacity-100' : 'opacity-0 w-0'}`}
                >
                  Volver a App
                </span>
              </NavLink>
            ) : (
              <NavLink
                to="/admin/users"
                className={`flex items-center gap-3 px-3 py-3 rounded-lg bg-indigo-900/30 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-900/50 hover:text-indigo-300 transition-all overflow-hidden whitespace-nowrap ${!showFullSidebar ? 'justify-center' : ''}`}
              >
                <Shield size={22} className="shrink-0" />
                <span
                  className={`transition-all duration-300 ${showFullSidebar ? 'opacity-100' : 'opacity-0 w-0'}`}
                >
                  Admin Panel
                </span>
              </NavLink>
            )}
          </div>
        )}

        {/* --- D. FOOTER USER --- */}
        <div className="p-4 border-t border-slate-800 space-y-4 shrink-0 overflow-hidden">
          {user && (
            <div
              className={`flex items-center gap-3 px-2 mb-2 transition-all duration-300 ${showFullSidebar ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/30 bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors whitespace-nowrap overflow-hidden ${!showFullSidebar ? 'justify-center' : ''}`}
            title="Cerrar Sesión"
          >
            <LogOut size={22} className="shrink-0" />
            <span
              className={`transition-all duration-300 ${showFullSidebar ? 'opacity-100' : 'opacity-0 w-0'}`}
            >
              Cerrar Sesión
            </span>
          </button>
        </div>
      </aside>
    </div>
  );
};
