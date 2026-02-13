import { useState } from 'react';
import { X, Lock, Check, AlertCircle } from 'lucide-react';
import type { Category, CreateCategoryDTO } from '../types';
import { CategoryType } from '../types';
import { useCategories } from '../hooks/useCategories';
import { CATEGORY_COLORS } from '../constants';
import axios from 'axios';

// 👇 1. Importamos iconMap directamente
import { IconPicker } from '@/components/common/IconPicker';
import { iconMap } from '@/components/common/icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

export const CategoryModal = ({ isOpen, onClose, categoryToEdit }: Props) => {
  const { createCategory, updateCategory, isCreating, isUpdating } =
    useCategories();

  const [name, setName] = useState(categoryToEdit?.name || '');
  const [type, setType] = useState<CategoryType>(
    categoryToEdit?.type || CategoryType.EXPENSE
  );
  const [isFixed, setIsFixed] = useState(categoryToEdit?.isFixed || false);
  const [color, setColor] = useState(
    categoryToEdit?.color || CATEGORY_COLORS[0]
  );

  const [icon, setIcon] = useState(categoryToEdit?.icon || 'Wallet');

  const IconSelected = iconMap[icon] || iconMap['Wallet'];

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const data: CreateCategoryDTO = { name, type, color, icon, isFixed };

    try {
      if (categoryToEdit) {
        await updateCategory({ id: categoryToEdit.id, data });
      } else {
        await createCategory(data);
      }
      onClose();
    } catch (err: unknown) {
      console.error('Error saving category', err);
      let backendMessage = 'Ocurrió un error al guardar la categoría.';

      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { message: string | string[] };
        backendMessage = Array.isArray(data.message)
          ? data.message[0]
          : data.message;
      }
      setError(backendMessage);
    }
  };

  if (!isOpen) return null;

  const isLoading = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">
            {categoryToEdit ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3 text-sm animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Formulario */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${
                  error
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-primary/20 focus:border-primary'
                }`}
                placeholder="Ej: Gimnasio"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setType(CategoryType.EXPENSE)}
                className={`py-1.5 text-sm font-medium rounded-md transition-all ${
                  type === CategoryType.EXPENSE
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => setType(CategoryType.INCOME)}
                className={`py-1.5 text-sm font-medium rounded-md transition-all ${
                  type === CategoryType.INCOME
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Ingreso
              </button>
            </div>
          </div>

          {/* Switch Fijo */}
          <div
            onClick={() => setIsFixed(!isFixed)}
            className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
              isFixed
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${isFixed ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                <Lock size={20} />
              </div>
              <div>
                <p
                  className={`font-bold ${isFixed ? 'text-primary' : 'text-gray-700'}`}
                >
                  Gasto Fijo Mensual
                </p>
                <p className="text-xs text-gray-500">
                  Alquiler, Internet, Seguros...
                </p>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                isFixed
                  ? 'bg-primary border-primary text-white'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {isFixed && <Check size={14} />}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color
            </label>
            <div className="flex flex-wrap gap-3">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                    color === c
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                      : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker Integrado */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Icono
              </label>
              {/* Previsualización del seleccionado */}
              <div
                className="w-6 h-6 rounded bg-primary text-white flex items-center justify-center shadow-sm"
                style={{ backgroundColor: color }}
              >
                {/* Ahora renderiza sin error */}
                <IconSelected size={14} />
              </div>
            </div>

            <IconPicker
              selectedIcon={icon}
              onSelect={(newIcon) => setIcon(newIcon)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
            className="flex-1 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isLoading ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
