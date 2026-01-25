import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
  return (
    // 1. CONTENEDOR PADRE: Ocupa toda la altura (h-screen) y es flexible (flex)
    <div className="flex h-screen w-full bg-gray-50">
      {/* 2. SIDEBAR: Ancho fijo (w-64), oculto en móvil (hidden md:block) */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-4">
          <h2 className="text-xl font-bold text-primary">Your Finance</h2>
          {/* Aquí irán los links de navegación más tarde */}
        </div>
      </aside>

      {/* 3. ZONA PRINCIPAL: Crece para ocupar el resto (flex-1) y es columna (flex-col) */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* A. NAVBAR: Altura fija (h-16), fondo blanco */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          {/* Texto temporal */}
          <span className="text-gray-500">Navbar</span>
        </header>

        {/* B. CONTENIDO DINÁMICO: Aquí es donde ocurre la magia */}
        <div className="flex-1 overflow-auto p-6">
          {/* PREGUNTA DE ORO: 
              ¿Qué componente de 'react-router-dom' importamos arriba 
              y debemos poner aquí para que se rendericen las rutas hijas?
           */}

          <Outlet />
        </div>
      </main>
    </div>
  );
};
