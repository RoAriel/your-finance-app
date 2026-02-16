import { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  File,
} from 'lucide-react';
import {
  exportService,
  type ExportFormat,
} from '@/features/transactions/services/export.service';
export type { ExportFormat } from '@/features/transactions/services/export.service';
import { triggerDownload } from '@/utils/download-helper';
import { toast } from 'react-hot-toast';

interface Props {
  accountId?: string | null;
  accountName?: string; // 👈 Nuevo prop
  userName?: string; // 👈 Nuevo prop
}

export const ExportButton = ({
  accountId,
  accountName = 'Consolidado', // Valor por defecto
  userName = 'Usuario', // Valor por defecto
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- HELPERS PARA EL NOMBRE DEL ARCHIVO ---
  const getFormattedDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}_${hour}${minute}`;
  };

  const sanitize = (text: string) => {
    // Reemplaza espacios por _ y elimina caracteres no alfanuméricos (excepto - y _)
    return text
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '');
  };
  // ------------------------------------------

  const handleExport = async (format: ExportFormat) => {
    setIsOpen(false);
    setIsExporting(true);

    const toastId = toast.loading('Generando reporte...');

    try {
      const response = await exportService.downloadTransactions(
        format,
        accountId
      );

      // --- LÓGICA DE EXTENSIÓN ---
      let ext = 'txt';
      if (format === 'excel') ext = 'xlsx';
      else if (format === 'csv') ext = 'csv';
      else if (format.startsWith('pdf')) ext = 'pdf';

      // --- CONSTRUCCIÓN DEL NOMBRE ---
      // Formato: Extracto_JuanPerez_BancoGalicia_20260216_1030.xlsx
      const safeUser = sanitize(userName);
      const safeAccount = accountId
        ? sanitize(accountName)
        : 'Todas_las_Cuentas';
      const timeStamp = getFormattedDate();

      const filename = `Extracto_${safeUser}_${safeAccount}_${timeStamp}.${ext}`;
      // -----------------------------

      triggerDownload(response.data, filename);

      toast.success('Descarga iniciada', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Error al exportar el archivo', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-medium transition-all shadow-sm disabled:opacity-50"
      >
        <Download size={18} />
        <span className="hidden sm:inline">
          {isExporting ? 'Exportando...' : 'Exportar'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
          <div className="py-1">
            {/* EXCEL */}
            <button
              onClick={() => handleExport('excel')}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 text-left transition-colors"
            >
              <FileSpreadsheet size={16} /> Excel (.xlsx)
            </button>

            {/* CSV */}
            <button
              onClick={() => handleExport('csv')}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 text-left transition-colors"
            >
              <FileText size={16} /> CSV (.csv)
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            {/* PDF TABLA */}
            <button
              onClick={() => handleExport('pdf-table')}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 text-left transition-colors"
            >
              <File size={16} /> Listado (.pdf)
            </button>

            {/* PDF VISUAL */}
            <button
              onClick={() => handleExport('pdf-visual')}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 text-left transition-colors"
            >
              <Printer size={16} /> Imprimir Reporte
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
