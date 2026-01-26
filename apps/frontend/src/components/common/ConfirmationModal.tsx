import { AlertTriangle, Info } from 'lucide-react';

export type ConfirmVariant = 'danger' | 'info';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
}: Props) => {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden transform transition-all scale-100">
        <div className="flex flex-col items-center p-6 text-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              isDanger ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}
          >
            {isDanger ? <AlertTriangle size={24} /> : <Info size={24} />}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 text-sm">{message}</p>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
