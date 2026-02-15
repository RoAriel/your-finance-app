import { useState } from 'react';
import { X, Save, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminService } from '../services/admin.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export const ResetPasswordModal = ({
  isOpen,
  onClose,
  userId,
  userName,
}: Props) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      await adminService.resetPassword(userId, password);
      toast.success('Contraseña actualizada correctamente');
      onClose();
      setPassword(''); // Limpiar campo
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="font-bold text-gray-800">Cambiar Contraseña</h3>
            <p className="text-xs text-gray-500">Usuario: {userName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type="text" // Texto visible para que el admin verifique lo que escribe
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Escribe la nueva clave..."
                className="w-full pl-10 pr-4 py-3 text-gray-800 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                autoFocus
              />
            </div>
            <p className="text-xs text-yellow-600 mt-2">
              ⚠️ El usuario deberá usar esta nueva clave para ingresar.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || password.length < 6}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              'Guardando...'
            ) : (
              <>
                <Save size={18} /> Actualizar Clave
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
