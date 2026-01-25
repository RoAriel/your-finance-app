export const formatCurrency = (amount: string | number, currency = 'ARS') => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short', // 'ene', 'feb'
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};
