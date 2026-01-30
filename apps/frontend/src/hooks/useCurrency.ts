import { useAuth } from '../features/auth/hooks/useAuth';

export const useCurrency = () => {
  const { user } = useAuth();

  // Moneda del usuario o ARS por defecto
  const currency = user?.currency || 'ARS';

  const format = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return { currency, format };
};
