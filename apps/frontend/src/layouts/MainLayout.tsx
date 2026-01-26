import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar'; // <--- Importamos el nuevo componente

export const MainLayout = () => {
  return (
    // 1. CONTENEDOR PADRE
    <div className="flex h-screen w-full bg-gray-50">
      {/* 2. SIDEBAR (Ya no está hardcodeado aquí) */}
      <Sidebar />

      {/* 3. ZONA PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* A. NAVBAR */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <span className="font-semibold text-gray-700">
            Bienvenido de nuevo 👋
          </span>
          {/* Aquí podrías poner un avatar de usuario más tarde */}
          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
            RA
          </div>
        </header>

        {/* B. CONTENIDO DINÁMICO */}
        <div className="flex-1 overflow-auto bg-gray-50/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
