import { Target, Plus, Trash2, Edit2 } from 'lucide-react';
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
  // Formateador de moneda
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: goal.currency,
    }).format(amount);

  // Color dinámico o default
  const accentColor = goal.color || '#3B82F6'; // Azul default

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
      {/* Header con Color */}
      <div className="h-2 w-full" style={{ backgroundColor: accentColor }} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Título y Menú */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
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
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">...</div>

            <div className="flex gap-1">
              {' '}
              {/* Agrupamos los botones */}
              <button
                onClick={() => onEdit(goal)} // 👈 Acción Editar
                className="text-gray-300 hover:text-primary transition-colors p-1"
                title="Editar meta"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(goal.id)}
                className="text-gray-300 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Balance Gigante */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 font-medium">Ahorrado</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatMoney(goal.balance)}
          </p>
        </div>

        {/* Barra de Progreso (Solo si hay target) */}
        {goal.targetAmount ? (
          <div className="mt-auto space-y-2">
            <div className="flex justify-between text-xs text-gray-500 font-medium">
              <span>{goal.progress}% completado</span>
              <span>Meta: {formatMoney(goal.targetAmount)}</span>
            </div>

            {/* El container de la barra */}
            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
              {/* La barra de relleno */}
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(goal.progress || 0, 100)}%`, // Tope visual 100%
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

        {/* Botón de Acción */}
        <div className="pt-5 mt-2">
          <button
            onClick={() => onDeposit(goal.id)}
            className="w-full py-2 flex items-center justify-center gap-2 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 hover:text-primary transition-colors text-sm"
          >
            <Plus size={16} />
            Depositar / Ajustar
          </button>
        </div>
      </div>
    </div>
  );
};
