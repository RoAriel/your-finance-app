import { useState } from 'react';
import { X } from 'lucide-react'; // Icono de cerrar
import { useCategories } from '../../categories/hooks/useCategories';
import { useCreateTransaction } from '../hooks/useTransactions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTransactionModal = ({ isOpen, onClose }: Props) => {
  // 1. Hooks de datos
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateTransaction();

  // 2. Estado del Formulario
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  // Fecha de hoy por defecto (formato YYYY-MM-DD para el input type="date")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // 3. Lógica de Filtrado: Solo mostrar categorías que coincidan con el tipo seleccionado
  const filteredCategories = categories.filter(
    (cat) => cat.type === type || cat.type === 'both'
  );

  // 4. Manejo del Envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !categoryId || !description) return;

    // Ejecutamos la mutación
    createMutation.mutate(
      {
        amount: parseFloat(amount), // Convertimos a número
        description,
        date: new Date(date).toISOString(), // Convertimos a ISO completo
        type,
        categoryId,
      },
      {
        onSuccess: () => {
          // Si todo sale bien:
          onClose(); // Cerramos modal
          resetForm(); // Limpiamos campos
        },
      }
    );
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategoryId('');
    setType('expense');
  };

  if (!isOpen) return null;

  return (
    // Overlay oscuro (Fondo)
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      {/* Contenedor del Modal */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">Nueva Transacción</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body (Formulario) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Selector de Tipo (Tabs visuales) */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                type === 'expense'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                type === 'income'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Ingreso
            </button>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-bold">
                $
              </span>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
            >
              <option value="">Selecciona una opción...</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {filteredCategories.length === 0 && (
              <p className="text-xs text-orange-500 mt-1">
                No hay categorías disponibles para este tipo.
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="Ej: Compras semana, Pago luz..."
            />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>

          {/* Botón Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending
                ? 'Guardando...'
                : 'Guardar Transacción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
