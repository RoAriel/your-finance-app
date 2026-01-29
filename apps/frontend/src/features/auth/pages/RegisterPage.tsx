import { useState } from 'react';
import { isAxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Wallet, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast'; // Opcional, para éxito

const CURRENCIES = ['ARS', 'USD', 'EUR', 'BRL'];

export const RegisterPage = () => {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    currency: 'ARS', // Default sugerido
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name) return;

    try {
      setIsLoading(true);

      // Llamamos al servicio
      await register(formData);

      // Feedback de éxito
      toast.success(`¡Bienvenido ${formData.name}! Tu billetera está lista.`);

      // Redirección (Usualmente al login o directo al dashboard si el back devuelve token)
    } catch (error) {
      // Valor por defecto
      let errorMessage = 'Ocurrió un error inesperado al registrarse';

      // 1. Chequeo: ¿Es un error de respuesta HTTP (Axios)?
      if (isAxiosError(error)) {
        // Aquí TS ya sabe que 'error' tiene la propiedad 'response'
        const data = error.response?.data as { message?: string | string[] };

        if (data?.message) {
          // Manejamos si el backend devuelve un string o un array de errores
          errorMessage = Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message;
        }
      }
      // 2. Chequeo: ¿Es un error genérico de JS (ej: fallo de red sin respuesta)?
      else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Visual */}
        <div className="bg-primary p-8 text-center">
          <div className="mx-auto w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <Wallet className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Crear Cuenta</h1>
          <p className="text-primary-foreground/80 text-sm">
            Únete y toma el control de tus finanzas
          </p>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <User size={18} />
                </span>
                <input
                  name="name"
                  type="text"
                  placeholder="Juan Pérez"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="hola@ejemplo.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-1">
                Mínimo 8 caracteres
              </p>
            </div>

            {/* Selector de Moneda Principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Moneda Principal
              </label>
              <div className="relative">
                {/* Un pequeño truco visual para el select */}
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white cursor-pointer"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-1">
                Se creará tu billetera en esta moneda.
              </p>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Crear Cuenta <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer Login */}
          <div className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
