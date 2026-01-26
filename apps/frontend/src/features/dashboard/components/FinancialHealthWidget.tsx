import { Info } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

interface Props {
  fixed: number;
  variable: number;
}

export const FinancialHealthWidget = ({ fixed, variable }: Props) => {
  const total = fixed + variable;
  // Evitamos división por cero
  const fixedPercent = total > 0 ? Math.round((fixed / total) * 100) : 0;
  const variablePercent = total > 0 ? 100 - fixedPercent : 0;

  // Semáforo de salud: Si gastos fijos > 50%, advertencia.
  const isHealthy = fixedPercent <= 50;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Estructura de Gastos
          </h3>
          <p className="text-sm text-gray-500">Fijos vs Variables</p>
        </div>

        {/* Badge de Estado */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            isHealthy
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700'
          }`}
        >
          {isHealthy ? 'Saludable' : 'Atención'}
        </div>
      </div>

      {/* Barra de Progreso */}
      <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex mb-4">
        {/* Parte Fija (Azul Oscuro) */}
        <div
          className="h-full bg-slate-600 transition-all duration-1000"
          style={{ width: `${fixedPercent}%` }}
        />
        {/* Parte Variable (Azul Claro) */}
        <div
          className="h-full bg-blue-400 transition-all duration-1000"
          style={{ width: `${variablePercent}%` }}
        />
      </div>

      {/* Leyenda y Montos */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-slate-600"></div>
            <span className="text-sm font-medium text-gray-600">
              Fijos ({fixedPercent}%)
            </span>
          </div>
          <p className="text-lg font-bold text-slate-800">
            {formatCurrency(fixed)}
          </p>
          <p className="text-xs text-gray-400">
            Alquiler, Servicios, Internet...
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-sm font-medium text-gray-600">
              Variables ({variablePercent}%)
            </span>
          </div>
          <p className="text-lg font-bold text-blue-600">
            {formatCurrency(variable)}
          </p>
          <p className="text-xs text-gray-400">Comida, Ocio, Compras...</p>
        </div>
      </div>

      {!isHealthy && (
        <div className="mt-4 flex gap-2 items-start p-3 bg-orange-50 rounded-lg text-orange-700 text-xs">
          <Info size={16} className="mt-0.5 shrink-0" />
          <p>
            Tus gastos fijos superan el 50% de tus egresos. Intenta mantenerlos
            bajos para tener más flexibilidad financiera.
          </p>
        </div>
      )}
    </div>
  );
};
