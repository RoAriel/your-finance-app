import { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useCreateTransaction,
  useUpdateTransaction,
} from '../hooks/useTransactions';
import { accountsService } from '../../accounts/services/accounts.service';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { AccountType } from '../../accounts/types';
import { CategoryType } from '../../categories/types';
import { CategorySelector } from '@/components/common/CategorySelector';
import { AccountSelector } from '@/components/common/AccountSelector';
import { useCategories } from '../../categories/hooks/useCategories';

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
  const queryClient = useQueryClient();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const transferMutation = useMutation({
    mutationFn: accountsService.transfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] }); // 👈 Refresca saldos tras transferir
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
    },
  });

  const isEditing = !!transactionToEdit;
  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    transferMutation.isPending;

  // --- ESTADOS ---

  const [type, setType] = useState<TransactionType>(() => {
    if (transactionToEdit?.type) return transactionToEdit.type;
    return TransactionType.EXPENSE;
  });

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

  const [accountId, setAccountId] = useState(
    transactionToEdit?.accountId || ''
  );

  const [targetAccountId, setTargetAccountId] = useState('');

  const [date, setDate] = useState(() => {
    if (transactionToEdit?.date) {
      return new Date(transactionToEdit.date).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });

  const { categories } = useCategories();

  // --- HELPERS ---

  const getCategoryFilter = (txType: TransactionType): CategoryType => {
    if (txType === TransactionType.INCOME) return CategoryType.INCOME;
    return CategoryType.EXPENSE;
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategoryId('');
    if (newType !== TransactionType.TRANSFER) {
      setTargetAccountId('');
    }
  };

  // --- SUBMIT ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔴 FIX: Eliminamos !description de la validación inicial
    if (!amount || !accountId) return;

    // 🔀 CAMINO A: Es una TRANSFERENCIA
    if (type === TransactionType.TRANSFER) {
      if (!targetAccountId) return;

      transferMutation.mutate({
        sourceAccountId: accountId,
        targetAccountId: targetAccountId,
        amount: parseFloat(amount),
        description: description || 'Transferencia',
        date: new Date(date).toISOString(),
      });
      return;
    }

    // Lógica de autocompletado de descripción
    let finalDescription = description;

    // Si no escribió nada, intentamos usar el nombre de la categoría
    if (!finalDescription && categoryId) {
      const selectedCategory = categories.find((c) => c.id === categoryId);
      if (selectedCategory) {
        finalDescription = selectedCategory.name;
      }
    }

    // 🔀 CAMINO B: Es GASTO o INGRESO
    if (!categoryId) return;

    // Si aún sigue vacía, ponemos un default
    if (!finalDescription) {
      finalDescription = 'Movimiento';
    }

    const transactionData = {
      amount: parseFloat(amount),
      description: finalDescription,
      date: new Date(date).toISOString(),
      type: type,
      categoryId,
      accountId,
      currency,
    };

    const options = { onSuccess: () => onClose() };

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
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange(TransactionType.EXPENSE)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                type === TransactionType.EXPENSE
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange(TransactionType.INCOME)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                type === TransactionType.INCOME
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange(TransactionType.TRANSFER)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                type === TransactionType.TRANSFER
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              Transf.
            </button>
          </div>

          {type === TransactionType.TRANSFER ? (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow-sm border border-gray-100 z-10 hidden sm:block">
                <ArrowRightLeft size={14} className="text-gray-400" />
              </div>

              <AccountSelector
                value={accountId}
                onChange={setAccountId}
                type={AccountType.WALLET}
                label="Desde (Origen)"
                placeholder="Cuenta origen..."
              />
              <AccountSelector
                value={targetAccountId}
                onChange={setTargetAccountId}
                type={AccountType.WALLET}
                label="Hacia (Destino)"
                placeholder="Cuenta destino..."
              />
            </div>
          ) : (
            <AccountSelector
              value={accountId}
              onChange={setAccountId}
              type={AccountType.WALLET}
              label={
                type === TransactionType.INCOME
                  ? 'Destino (Cuenta)'
                  : 'Origen (Cuenta)'
              }
              placeholder="Selecciona la cuenta..."
            />
          )}

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

          {type !== TransactionType.TRANSFER && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <CategorySelector
                value={categoryId}
                onChange={setCategoryId}
                type={getCategoryFilter(type)}
                placeholder="Selecciona una categoría..."
              />
            </div>
          )}

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <input
              type="text"
              // 🔴 FIX: Quitamos 'required'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              placeholder={
                categoryId
                  ? 'Opcional (se usará el nombre de la categoría)'
                  : 'Opcional'
              }
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={
                isLoading ||
                !accountId ||
                (type === TransactionType.TRANSFER
                  ? !targetAccountId
                  : !categoryId)
              }
              className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading
                ? 'Procesando...'
                : isEditing
                  ? 'Guardar Cambios'
                  : type === TransactionType.TRANSFER
                    ? 'Transferir Fondos'
                    : 'Crear Transacción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
