import { useAccounts } from '../../features/accounts/hooks/useAccounts';
import { AccountType } from '../../features/accounts/types';

interface Props {
  value: string;
  onChange: (value: string) => void;
  type?: AccountType; // 'WALLET' | 'SAVINGS' | undefined (todo)
  label?: string;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const AccountSelector = ({
  value,
  onChange,
  type, // Si pasas AccountType.WALLET, solo muestra billeteras
  label = 'Cuenta',
  placeholder = 'Selecciona una cuenta...',
  className = '',
  error,
}: Props) => {
  // El hook ya se encarga de filtrar según el prop 'type'
  const { accounts, isLoading } = useAccounts({ type });

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>

      {isLoading ? (
        <div className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 animate-pulse">
          Cargando cuentas...
        </div>
      ) : (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-gray-700 appearance-none ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {accounts.length > 0 ? (
              accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency}) -{' '}
                  {new Intl.NumberFormat('es-AR', {
                    style: 'currency',
                    currency: acc.currency,
                  }).format(acc.balance)}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No hay cuentas disponibles
              </option>
            )}
          </select>
          {/* Icono Flecha */}
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
