import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useSavings } from '../hooks/useSavings';
import { ConfirmationModal } from '../../../components/common/ConfirmationModal';
import type { SavingsGoal } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
}

const COLORS = [
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#6366F1',
  '#14B8A6',
];
const CURRENCIES = ['ARS', 'USD', 'EUR', 'BRL'];

export const CreateEditSavingsModal = ({
  isOpen,
  onClose,
  goalToEdit,
}: Props) => {
  const { createGoal, updateGoal } = useSavings();
  const [isLoading, setIsLoading] = useState(false);

  // Estados del formulario
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [currency, setCurrency] = useState('ARS');

  // 👇 1. Estado para manejar el cambio de moneda riesgoso
  const [pendingCurrency, setPendingCurrency] = useState<string | null>(null);

  // Rellenar formulario al abrir
  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        // MODO EDICIÓN
        setName(goalToEdit.name);
        setTargetAmount(goalToEdit.targetAmount?.toString() || '');
        setTargetDate(
          goalToEdit.targetDate
            ? new Date(goalToEdit.targetDate).toISOString().split('T')[0]
            : ''
        );
        setColor(goalToEdit.color || COLORS[0]);
        setCurrency(goalToEdit.currency);
      } else {
        // MODO CREACIÓN
        setName('');
        setTargetAmount('');
        setTargetDate('');
        setColor(COLORS[0]);
        setCurrency('ARS');
      }
    }
  }, [isOpen, goalToEdit]);

  // 👇 2. FUNCIONES FALTANTES (Restauradas)
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    // Si editamos y cambia la moneda...
    if (goalToEdit && newCurrency !== currency) {
      setPendingCurrency(newCurrency); // Guardar intención y avisar
    } else {
      setCurrency(newCurrency); // Si es nuevo, cambiar directo
    }
  };

  const confirmCurrencyChange = () => {
    if (pendingCurrency) {
      setCurrency(pendingCurrency);
      setPendingCurrency(null);
    }
  };

  const cancelCurrencyChange = () => {
    setPendingCurrency(null); // Cancelar y cerrar modal de warning
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      setIsLoading(true);
      const payload = {
        name,
        targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
        color,
        currency,
      };

      if (goalToEdit) {
        await updateGoal({ id: goalToEdit.id, data: payload });
      } else {
        await createGoal(payload);
      }
      onClose();
    } catch (error) {
      console.log(error);

      // Manejo global
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isEdit = !!goalToEdit;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">
              {isEdit ? 'Editar Meta' : 'Nueva Meta'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Moneda */}
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda
                </label>
                <select
                  value={currency}
                  onChange={handleCurrencyChange} // 👈 3. Solo este onChange
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Meta Monto */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta ($)
                </label>
                <input
                  type="number"
                  placeholder="Opcional"
                  min="0"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Límite
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      color === c
                        ? 'scale-110 ring-2 ring-offset-2 ring-gray-400'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || !name}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {isLoading && <Loader2 size={18} className="animate-spin" />}
                {isEdit ? 'Guardar Cambios' : 'Crear Meta'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 👇 EL MODAL DE ADVERTENCIA */}
      <ConfirmationModal
        isOpen={!!pendingCurrency}
        onClose={cancelCurrencyChange}
        onConfirm={confirmCurrencyChange}
        title="¿Cambiar moneda?"
        message={`Atención: Cambiar la moneda no convertirá automáticamente el saldo existente. Si tienes 1000 ${currency}, pasarán a ser 1000 ${pendingCurrency}. ¿Deseas continuar?`}
        confirmText="Sí, cambiar"
        cancelText="Cancelar"
        variant="danger" // Si da error 'warning', prueba con 'danger'
      />
    </>
  );
};
