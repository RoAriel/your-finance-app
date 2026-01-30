import { Target, Plus, Trash2, Edit2, History } from 'lucide-react'; // 1. Importar History
import { useNavigate } from 'react-router-dom'; // 2. Importar useNavigate
import type { SavingsGoal } from '../types';

interface Props {
  goal: SavingsGoal;
  onDeposit: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (goal: SavingsGoal) => void;
}

export const SavingsGoalCard = ({
  goal,
  onDeposit,
  onDelete,
  onEdit,
}: Props) => {
  const navigate = useNavigate(); // 3. Hook de navegación

  // Formateador de moneda
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: goal.currency,
    }).format(amount);

  const accentColor = goal.color || '#3B82F6';

  // 4. Handler para navegar al historial
  const handleViewHistory = () => {
    navigate(`/transactions?accountId=${goal.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full transition-all hover:shadow-md group">
      {/* Header con Color */}
      <div className="h-2 w-full" style={{ backgroundColor: accentColor }} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Título y Menú */}
        <div className="flex justify-between items-start mb-4">
          {/* Título clickeable también para mejor UX */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleViewHistory}
            title="Ver movimientos"
          >
            <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
              <Target size={20} style={{ color: accentColor }} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{goal.name}</h3>
              {goal.targetDate && (
                <p className="text-xs text-gray-400">
                  Vence: {new Date(goal.targetDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(goal)}
              className="text-gray-400 hover:text-primary transition-colors p-1"
              title="Editar"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Balance Gigante */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 font-medium">Ahorrado</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatMoney(goal.balance)}
          </p>
        </div>

        {/* Barra de Progreso (Lógica existente...) */}
        {goal.targetAmount ? (
          <div className="mt-auto space-y-2">
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>{goal.progress}% completado</span>
              <span>Meta: {formatMoney(goal.targetAmount)}</span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(goal.progress || 0, 100)}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-4 border-t border-dashed border-gray-100">
            <p className="text-xs text-gray-400">
              Cuenta de ahorro general (sin límite)
            </p>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="pt-5 mt-2 grid grid-cols-2 gap-2">
          {/* Botón Ver Historial */}
          <button
            onClick={handleViewHistory}
            className="flex items-center justify-center gap-2 py-2 text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors text-sm font-medium"
            title="Ver historial de movimientos"
          >
            <History size={16} />
            Historial
          </button>

          {/* Botón Depositar */}
          <button
            onClick={() => onDeposit(goal.id)}
            className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm"
          >
            <Plus size={16} />
            Depositar
          </button>
        </div>
      </div>
    </div>
  );
};
