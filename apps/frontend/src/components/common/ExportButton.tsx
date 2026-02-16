import { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react';
import {
  exportService,
  type ExportFormat,
} from '@/features/transactions/services/export.service';
export type { ExportFormat } from '@/features/transactions/services/export.service';
import { triggerDownload } from '@/utils/download-helper';
import { toast } from 'react-hot-toast';
interface Props {
  accountId?: string | null; // El filtro actual
}

export const ExportButton = ({ accountId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
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

  const handleExport = async (format: ExportFormat) => {
    setIsOpen(false); // Cerramos menú
    setIsExporting(true);
    const toastId = toast.loading(
      `Generando reporte ${format.toUpperCase()}...`
    );

    try {
      const response = await exportService.downloadTransactions(
        format,
        accountId
      );

      // Determinar extensión y nombre
      const ext = format === 'excel' ? 'xlsx' : format;
      const filename = `Reporte_Transacciones_${new Date().toISOString().slice(0, 10)}.${ext}`;

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
      {/* Botón Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl font-medium transition-all shadow-sm disabled:opacity-50"
      >
        <Download size={18} />
        <span className="hidden sm:inline">Exportar</span>
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
          <div className="py-1">
            <button
              onClick={() => handleExport('excel')}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 text-left transition-colors"
            >
              <FileSpreadsheet size={16} /> Excel (.xlsx)
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 text-left transition-colors"
            >
              <FileText size={16} /> CSV (.csv)
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 text-left transition-colors"
            >
              <File size={16} /> PDF (.pdf)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
