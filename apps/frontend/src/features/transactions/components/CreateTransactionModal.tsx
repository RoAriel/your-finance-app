import { X } from 'lucide-react';
import { useState } from 'react';
import {
  useCreateTransaction,
  useUpdateTransaction,
} from '../hooks/useTransactions';
import type { Transaction } from '../types';
import { CategorySelector } from '../../../components/common/CategorySelector';
// 👇 Importamos el nuevo selector y tipos
import { AccountSelector } from '../../../components/common/AccountSelector';
import { AccountType } from '../../accounts/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: Transaction | null;
}

export const CreateTransactionModal = ({
  isOpen,
  onClose,
  transactionToEdit,
}: Props) => {
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const isEditing = !!transactionToEdit;

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // ESTADOS
  const [type, setType] = useState<Transaction['type']>(
    transactionToEdit?.type || 'expense'
  );
  const [amount, setAmount] = useState(
    transactionToEdit?.amount?.toString() || ''
  );
  const [currency, setCurrency] = useState(
    transactionToEdit?.currency || 'ARS'
  );
  const [description, setDescription] = useState(
    transactionToEdit?.description || ''
  );
  const [categoryId, setCategoryId] = useState(
    transactionToEdit?.categoryId || ''
  );
  // 👇 Nuevo estado para la Cuenta
  const [accountId, setAccountId] = useState(
    transactionToEdit?.accountId || ''
  );

  // Fecha
  const initialDate = transactionToEdit?.date
    ? new Date(transactionToEdit.date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(initialDate);

  const handleTypeChange = (newType: Transaction['type']) => {
    setType(newType);
    setCategoryId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 👇 Validamos accountId
    if (!amount || !categoryId || !description || !accountId) return;

    const transactionData = {
      amount: parseFloat(amount),
      description,
      date: new Date(date).toISOString(),
      type: type as 'income' | 'expense',
      categoryId,
      accountId, // 👈 Enviamos la cuenta seleccionada
      currency,
    };

    const options = {
      onSuccess: () => {
        onClose();
      },
    };

    if (isEditing && transactionToEdit) {
      updateMutation.mutate(
        { id: transactionToEdit.id, data: transactionData },
        options
      );
    } else {
      createMutation.mutate(transactionData, options);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">
            {isEditing ? 'Editar Transacción' : 'Nueva Transacción'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tabs Tipo */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {/* ... (código de tabs igual que antes) ... */}
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                type === 'expense'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                type === 'income'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Ingreso
            </button>
          </div>

          {/* 👇 Selector de Cuenta (NUEVO) */}
          {/* Filtramos solo WALLET porque normalmente gastas/cobras en billeteras */}
          <AccountSelector
            value={accountId}
            onChange={setAccountId}
            type={AccountType.WALLET}
            label={type === 'income' ? 'Destino (Cuenta)' : 'Origen (Cuenta)'}
            placeholder="Selecciona la cuenta..."
          />

          {/* Monto y Moneda */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
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
                className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
              >
                <option value="ARS">ARS 🇦🇷</option>
                <option value="USD">USD 🇺🇸</option>
                <option value="EUR">EUR 🇪🇺</option>
              </select>
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <CategorySelector
              value={categoryId}
              onChange={setCategoryId}
              type={type === 'expense' ? 'EXPENSE' : 'INCOME'}
              placeholder="Selecciona una categoría..."
            />
          </div>

          {/* Descripción y Fecha (Igual que antes) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Botón Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !accountId} // 👈 Bloqueamos si no hay cuenta
              className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar Cambios'
                  : 'Crear Transacción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
