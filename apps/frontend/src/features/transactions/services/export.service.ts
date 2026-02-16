import { api } from '@/lib/axios';

// 1. Actualizamos los tipos para soportar los dos PDFs
export type ExportFormat = 'excel' | 'csv' | 'pdf-table' | 'pdf-visual';

export const exportService = {
  downloadTransactions: async (
    format: ExportFormat,
    accountId?: string | null
  ) => {
    // 2. Mapeo de Endpoints actualizado
    const endpoints: Record<ExportFormat, string> = {
      excel: '/reports/export', // .xlsx
      csv: '/reports/export/csv', // .csv
      'pdf-table': '/reports/export/pdf/table', // .pdf (Listado)
      'pdf-visual': '/reports/export/pdf/visual', // .pdf (Gráficos/Imprimible)
    };

    const params: Record<string, string> = {};
    // Si accountId existe (y no es 'all' o null), lo agregamos
    if (accountId) {
      params.accountId = accountId;
    }

    const response = await api.get(endpoints[format], {
      params,
      responseType: 'blob',
      timeout: 120000,
    });

    return response;
  },
};
