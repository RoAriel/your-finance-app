import { useState } from 'react';
import { X, Wallet, TrendingUp, PiggyBank } from 'lucide-react';
import { useAccounts } from '../hooks/useAccounts';
import { AccountType } from '../types';
import type { CreateAccountDTO } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: AccountType; // Para preseleccionar si vienes de un botón específico
}

export const CreateAccountModal = ({ isOpen, onClose, defaultType }: Props) => {
  const { createAccount, isCreating } = useAccounts();

  // Estados del formulario
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>(
    defaultType || AccountType.WALLET
  );
  const [currency, setCurrency] = useState('ARS');
  // Campos específicos para Savings
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const dto: CreateAccountDTO = {
      name,
      type,
      currency,
      // Solo enviamos estos datos si es una Meta de Ahorro
      ...(type === AccountType.SAVINGS && {
        targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
        targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      }),
      // Default colors/icons según el tipo (puedes mejorarlo luego con un selector)
      color: type === AccountType.SAVINGS ? '#8B5CF6' : '#10B981',
      icon: type === AccountType.SAVINGS ? 'TrendingUp' : 'Wallet',
    };

    try {
      await createAccount(dto);
      onClose();
    } catch (error) {
      console.error('Error creando cuenta:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            {type === AccountType.SAVINGS ? (
              <TrendingUp className="text-purple-600" size={20} />
            ) : (
              <Wallet className="text-emerald-600" size={20} />
            )}
            {type === AccountType.SAVINGS
              ? 'Nueva Meta de Ahorro'
              : 'Nueva Cuenta'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selector de Tipo (Solo si no viene predefinido o queremos permitir cambiar) */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType(AccountType.WALLET)}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                type === AccountType.WALLET
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium ring-1 ring-emerald-200'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Wallet size={18} />
              Billetera
            </button>
            <button
              type="button"
              onClick={() => setType(AccountType.SAVINGS)}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                type === AccountType.SAVINGS
                  ? 'bg-purple-50 border-purple-200 text-purple-700 font-medium ring-1 ring-purple-200'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <PiggyBank size={18} />
              Meta
            </button>
          </div>

          {/* Nombre y Moneda */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la cuenta
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  type === AccountType.SAVINGS
                    ? 'Ej: Viaje a Europa'
                    : 'Ej: Efectivo'
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
              >
                <option value="ARS">Peso Argentino (ARS)</option>
                <option value="USD">Dólar Estadounidense (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
          </div>

          {/* Campos Extra para SAVINGS (Condicionales) */}
          {type === AccountType.SAVINGS && (
            <div className="bg-purple-50 p-4 rounded-xl space-y-4 border border-purple-100 animate-in slide-in-from-top-2 duration-200">
              <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                <TrendingUp size={14} />
                Objetivos (Opcional)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-purple-700 mb-1">
                    Monto Objetivo
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-purple-700 mb-1">
                    Fecha Límite
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isCreating || !name}
            className={`w-full py-3 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 transition-colors ${
              type === AccountType.SAVINGS
                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >
            {isCreating
              ? 'Creando...'
              : type === AccountType.SAVINGS
                ? 'Crear Meta'
                : 'Crear Billetera'}
          </button>
        </form>
      </div>
    </div>
  );
};
