import { useState } from 'react';
import { X, Loader2, ArrowUpRight } from 'lucide-react';
import { useSavings } from '../hooks/useSavings';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  goalId: string | null;
  goalName?: string;
}

export const DepositModal = ({ isOpen, onClose, goalId, goalName }: Props) => {
  const { depositToGoal } = useSavings();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalId || !amount) return;

    try {
      setIsLoading(true);
      await depositToGoal({
        id: goalId,
        data: {
          amount: parseFloat(amount),
          description: description || 'Depósito manual',
        },
      });

      // Reset y cerrar
      setAmount('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error en depósito:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !goalId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Registrar Depósito
            </h2>
            <p className="text-sm text-gray-500">Para: {goalName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto a depositar
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                $
              </span>
              <input
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-lg font-semibold text-green-700"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nota (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Ahorro del mes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !amount}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex justify-center items-center gap-2 disabled:opacity-50 mt-2 shadow-sm"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ArrowUpRight size={18} />
            )}
            Confirmar Depósito
          </button>
        </form>
      </div>
    </div>
  );
};
