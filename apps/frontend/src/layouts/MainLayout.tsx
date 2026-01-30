import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { TopBar } from '../components/layout/TopBar'; // Asegúrate de crear este archivo

export const MainLayout = () => {
  // Estado para controlar si el sidebar está colapsado (Desktop) o abierto (Mobile)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* 1. SIDEBAR INTELIGENTE */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={toggleSidebar}
      />

      {/* 2. ZONA PRINCIPAL */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* A. HEADER DELGADO (TopBar) */}
        <TopBar toggleSidebar={toggleSidebar} />

        {/* B. CONTENIDO DINÁMICO (Outlet) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50/50 p-4 md:p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
