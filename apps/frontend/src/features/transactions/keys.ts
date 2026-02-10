export const transactionKeys = {
  // Llave raíz (para invalidar TODO lo relacionado con transacciones)
  all: ['transactions'] as const,

  // Listas (ej: tabla de movimientos)
  lists: () => [...transactionKeys.all, 'list'] as const,

  // Lista con filtros específicos (ej: página 1, búsqueda 'supermercado')
  list: (filters: Record<string, unknown>) =>
    [...transactionKeys.lists(), { ...filters }] as const,

  // Detalles (ej: ver una transacción sola)
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,

  // Balance (saldo total)
  balance: () => [...transactionKeys.all, 'balance'] as const,
};
