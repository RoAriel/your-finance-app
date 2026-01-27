import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTodo, LogOut, Tags, Wallet } from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';

export const Sidebar = () => {
  const { logout } = useAuth();

  const navLinks = [
    {
      to: '/dashboard',
      text: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      to: '/transactions',
      text: 'Movimientos',
      icon: <ListTodo size={20} />,
    },
    {
      to: '/categories',
      text: 'Categorías',
      icon: <Tags size={20} />,
    },
    {
      to: '/budgets', // ✅ Nuevo link
      text: 'Presupuestos',
      icon: <Wallet size={20} />, // ✅ Nuevo icono
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full md:flex">
      {/* 1. LOGO */}
      <div className="p-6 h-16 flex items-center border-b border-gray-50">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          Your Finance
        </h2>
      </div>

      {/* 2. NAVEGACIÓN */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
              ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-primary'
              }
            `}
          >
            {link.icon}
            <span>{link.text}</span>
          </NavLink>
        ))}
      </nav>

      {/* 3. FOOTER (Logout) */}
      <div className="p-4 border-t border-gray-50">
        <button
          onClick={logout} // ✅ Conectado a la función real
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
