import { FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Transaction } from '../../features/transactions/types';

interface Props {
  transactions: Transaction[];
  fileName?: string;
  className?: string;
}

export const ExportButton = ({
  transactions,
  fileName = 'movimientos',
  className = '',
}: Props) => {
  const handleExport = () => {
    if (!transactions || transactions.length === 0) {
      alert('No hay movimientos para exportar');
      return;
    }

    // 1. Aplanamos los datos para que queden bonitos en el Excel
    const dataToExport = transactions.map((t) => ({
      Fecha: new Date(t.date).toLocaleDateString(),
      Descripción: t.description,
      Monto: t.amount,
      Moneda: t.currency,
      Tipo:
        t.type === 'INCOME'
          ? 'Ingreso'
          : t.type === 'EXPENSE'
            ? 'Gasto'
            : 'Transferencia',
      Categoría: t.category?.name || 'Sin categoría', // Acceso seguro
      Cuenta: t.account?.name || 'Cuenta eliminada', // Acceso seguro
    }));

    // 2. Crear hoja de trabajo (Worksheet)
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // 3. Ajustar ancho de columnas (Opcional, pero se ve mejor)
    const wscols = [
      { wch: 12 }, // Fecha
      { wch: 30 }, // Descripción
      { wch: 10 }, // Monto
      { wch: 8 }, // Moneda
      { wch: 10 }, // Tipo
      { wch: 15 }, // Categoría
      { wch: 15 }, // Cuenta
    ];
    worksheet['!cols'] = wscols;

    // 4. Crear libro de trabajo (Workbook) y agregar la hoja
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Movimientos');

    // 5. Descargar archivo
    XLSX.writeFile(
      workbook,
      `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  return (
    <button
      onClick={handleExport}
      className={`flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm font-medium ${className}`}
      title="Descargar Excel"
    >
      <FileSpreadsheet size={18} />
      <span className="hidden sm:inline">Exportar Excel</span>
    </button>
  );
};
