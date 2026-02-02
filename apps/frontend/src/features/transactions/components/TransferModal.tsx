import { useState } from 'react';
import { X, ArrowRight, ArrowRightLeft } from 'lucide-react';
import { useAccounts } from '../../accounts/hooks/useAccounts';
import { AccountSelector } from '../../../components/common/AccountSelector';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal = ({ isOpen, onClose }: Props) => {
  const { transfer, isTransferring } = useAccounts(); // Usamos la mutación 'transfer' del hook

  // Estados independientes para este flujo
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId || !amount) return;
    if (sourceId === targetId) return; // Validación visual extra

    try {
      await transfer({
        sourceAccountId: sourceId,
        targetAccountId: targetId,
        amount: parseFloat(amount),
        description: description || 'Transferencia entre cuentas',
        date: new Date(date).toISOString(),
      });
      onClose(); // Cerrar solo si tuvo éxito
    } catch (error) {
      console.error('Error al transferir', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <ArrowRightLeft size={18} />
            </div>
            Transferir Dinero
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Origen -> Destino */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-4 relative">
            <AccountSelector
              label="Desde (Origen)"
              value={sourceId}
              onChange={setSourceId}
              placeholder="Elige cuenta origen"
              className="bg-transparent"
            />

            {/* Flecha decorativa */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1.5 rounded-full shadow-sm border border-gray-100 z-10 text-gray-400">
              <ArrowRight size={16} />
            </div>

            <AccountSelector
              label="Hacia (Destino)"
              value={targetId}
              onChange={setTargetId}
              placeholder="Elige cuenta destino"
              className="bg-transparent"
            />
          </div>

          {/* Aviso si selecciona la misma cuenta */}
          {sourceId && targetId && sourceId === targetId && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
              <X size={14} /> La cuenta de destino debe ser diferente.
            </div>
          )}

          {/* Monto y Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow"
              />
            </div>
          </div>

          {/* Nota */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nota (Opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow"
              placeholder="Ej: Ahorro para vacaciones"
            />
          </div>

          {/* Botón Acción */}
          <button
            type="submit"
            disabled={
              isTransferring ||
              !sourceId ||
              !targetId ||
              !amount ||
              sourceId === targetId
            }
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm shadow-primary/30"
          >
            {isTransferring ? 'Transfiriendo...' : 'Confirmar Transferencia'}
          </button>
        </form>
      </div>
    </div>
  );
};
