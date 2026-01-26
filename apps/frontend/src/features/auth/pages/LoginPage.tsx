import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios'; // 1. Importamos Axios para validar errores
import { authService } from '../services/auth.service';
import { logger } from '../../../utils/appLogger';
import { LogIn, AlertCircle } from 'lucide-react'; // 2. Agregamos AlertCircle

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // (Eliminamos el 'a gn' que tenías aquí colgado por error)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.login({ email, password });
      navigate('/dashboard');
    } catch (err: unknown) {
      // 3. Corregimos 'any' por 'unknown'
      let msg = 'Error al iniciar sesión';

      // 4. Lógica segura para extraer el mensaje del Backend
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data as { message: string | string[] };
        msg = Array.isArray(data.message) ? data.message[0] : data.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }

      setError(msg);
      logger.error('Fallo en login UI', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Bienvenido de nuevo
          </h2>
          <p className="text-muted mt-2">Ingresa a tu panel de finanzas</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 5. Alerta de error mejorada */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null); // Borramos error al escribir
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null); // Borramos error al escribir
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};
