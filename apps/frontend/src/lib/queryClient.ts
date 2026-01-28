import { QueryClient, MutationCache } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Helper para extraer el mensaje limpio del error que manda NestJS
const getErrorMessage = (error: any) => {
  // NestJS con class-validator a veces devuelve un array de strings
  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message[0]; // Ej: "El monto debe ser positivo"
  }
  if (typeof message === 'string') {
    return message; // Ej: "Saldo insuficiente"
  }
  return 'Ocurrió un error inesperado';
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60 * 1000, // 1 minuto
      refetchOnWindowFocus: false,
    },
  },
  // 👇 AQUÍ ESTÁ LA MAGIA GLOBAL
  mutationCache: new MutationCache({
    onError: (error) => {
      const msg = getErrorMessage(error);

      // Lanzamos la notificación visual
      toast.error(msg, {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#FEF2F2', // Rojo muy suave
          color: '#991B1B', // Rojo oscuro
          border: '1px solid #F87171',
          padding: '16px',
          fontWeight: 500,
        },
        iconTheme: {
          primary: '#EF4444',
          secondary: '#FEF2F2',
        },
      });
    },
    // Opcional: También puedes poner un toast de éxito global aquí si quisieras
    onSuccess: () => {
      // Lanzamos la notificación visual de éxito
      toast.success('Operación exitosa', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#F0FDF4', // Verde muy suave (Green-50)
          color: '#166534', // Verde oscuro (Green-800)
          border: '1px solid #4ADE80', // Verde vibrante (Green-400)
          padding: '16px',
          fontWeight: 500,
        },
        iconTheme: {
          primary: '#22C55E', // Verde estándar (Green-500)
          secondary: '#F0FDF4', // Mismo fondo que el toast
        },
      });
    },
  }),
});
