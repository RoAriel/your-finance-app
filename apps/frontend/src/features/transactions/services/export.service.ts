import { api } from '@/lib/axios';

export type ExportFormat = 'excel' | 'csv' | 'pdf';

export const exportService = {
  downloadTransactions: async (
    format: ExportFormat,
    accountId?: string | null
  ) => {
    // 1. Mapeo de Endpoints
    const endpoints: Record<ExportFormat, string> = {
      excel: '/reports/export', // .xlsx
      csv: '/reports/export/csv', // .csv
      pdf: '/reports/export/pdf', // .pdf
    };

    // 2. Configurar Params (limpiamos si es null/undefined)
    const params: Record<string, string> = {};
    if (accountId) {
      params.accountId = accountId;
    }

    // 3. Petición al Backend
    const response = await api.get(endpoints[format], {
      params,
      responseType: 'blob', // 👈 CLAVE: Indica que esperamos un archivo binario
      timeout: 120000,
    });

    return response; // Devolvemos la respuesta completa para acceder a headers si hiciera falta
  },
};
