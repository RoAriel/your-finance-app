import { QueryClient, MutationCache } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';

// Helper para extraer el mensaje limpio del error
const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message[0];
    if (typeof message === 'string') return message;
  }
  if (error instanceof Error) return error.message;
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
  mutationCache: new MutationCache({
    onError: (error) => {
      const msg = getErrorMessage(error);

      // 👇 ESTILO TAILWIND PURO (Error)
      toast.error(msg, {
        duration: 4000,
        position: 'top-center',
        className:
          'bg-red-50 border border-red-200 text-red-800 font-medium shadow-lg',
        iconTheme: {
          primary: '#EF4444', // Tailwind red-500
          secondary: '#FEF2F2', // Tailwind red-50
        },
      });
    },
    onSuccess: () => {
      // 👇 ESTILO TAILWIND PURO (Éxito)
      // Nota: Si quieres un mensaje específico por mutación,
      // puedes pasar onSuccess en el hook individual en vez de aquí globalmente.
      // Pero como default está bien.
      toast.success('Operación exitosa', {
        duration: 3000,
        position: 'top-center',
        className:
          'bg-green-50 border border-green-200 text-green-800 font-medium shadow-lg',
        iconTheme: {
          primary: '#10B981', // Tailwind emerald-500
          secondary: '#ECFDF5', // Tailwind emerald-50
        },
      });
    },
  }),
});
