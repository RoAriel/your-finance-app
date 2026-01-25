import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// 1. Importamos las piezas clave de React Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';

// 2. Creamos la instancia del cliente (el cerebro del caché)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configuración opcional pero recomendada:
      // Si falla, reintenta 1 vez en lugar de 3 (para desarrollo es más rápido)
      retry: 1,
      // Los datos se consideran "frescos" por 1 minuto
      staleTime: 1000 * 60,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 3. Envolvemos TODA la app con el Provider */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
