import { useState, useMemo } from 'react';
import { X, ArrowRightLeft, Loader2, ArrowRight } from 'lucide-react';
import { useSavings } from '../hooks/useSavings';
import type { SavingsGoal } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  goals: SavingsGoal[];
}

export const TransferModal = ({ isOpen, onClose, goals }: Props) => {
  // 👇 Usamos 'transferGoal' (según definimos en el hook useSavings)
  const { transferGoal } = useSavings();
  const [isLoading, setIsLoading] = useState(false);

  // Estados del formulario
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Validaciones visuales
  const sourceGoal = goals.find((g) => g.id === sourceId);
  const maxAmount = sourceGoal ? sourceGoal.balance : 0;

  // Filtrar lista de destino para no mostrar la cuenta origen seleccionada
  const targetOptions = useMemo(() => {
    return goals.filter((g) => g.id !== sourceId);
  }, [goals, sourceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId || !amount) return;

    try {
      setIsLoading(true);

      // 👇 Llamada limpia. Si falla, el Toast Global salta solo.
      await transferGoal({
        sourceAccountId: sourceId,
        targetAccountId: targetId,
        amount: parseFloat(amount),
        description: description || undefined,
      });

      // Si pasa el await, fue ÉXITO: Limpiamos y cerramos
      setSourceId('');
      setTargetId('');
      setAmount('');
      setDescription('');
      onClose();
    } catch (error) {
      console.log(error);

      // 🤫 Silencio: El QueryClient global ya manejó el error visualmente.
      // Solo dejamos el catch para que el 'finally' quite el loading.
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <ArrowRightLeft className="text-primary" size={20} />
            Transferir Fondos
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* ORIGEN */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Desde (Origen)
              </label>
              <select
                value={sourceId}
                onChange={(e) => {
                  setSourceId(e.target.value);
                  setTargetId(''); // Reset destino al cambiar origen
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white transition-shadow"
                required
              >
                <option value="">Seleccionar...</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id} disabled={g.balance <= 0}>
                    {g.name} (${g.balance})
                  </option>
                ))}
              </select>
            </div>

            {/* DESTINO */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Hacia (Destino)
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white transition-shadow"
                required
                disabled={!sourceId}
              >
                <option value="">Seleccionar...</option>
                {targetOptions.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Indicador visual de flujo */}
          {sourceId && targetId && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 p-2 rounded-lg animate-in fade-in">
              <span className="font-medium">{sourceGoal?.name}</span>
              <ArrowRight size={14} />
              <span className="font-medium">
                {goals.find((g) => g.id === targetId)?.name}
              </span>
            </div>
          )}

          {/* MONTO */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto a transferir
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                $
              </span>
              <input
                type="number"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                max={maxAmount}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none font-semibold text-lg transition-shadow"
              />
            </div>
            {sourceId && (
              <p className="text-xs text-gray-500 mt-1 text-right">
                Disponible:{' '}
                <span className="font-medium text-gray-700">
                  ${sourceGoal?.balance}
                </span>
              </p>
            )}
          </div>

          {/* DESCRIPCION */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nota (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Ahorro para viaje..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={
              isLoading ||
              !sourceId ||
              !targetId ||
              !amount ||
              parseFloat(amount) > maxAmount
            }
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium flex justify-center items-center gap-2 disabled:opacity-50 mt-2 shadow-sm transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <ArrowRightLeft size={18} />
            )}
            Confirmar Transferencia
          </button>
        </form>
      </div>
    </div>
  );
};
