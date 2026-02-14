import { BudgetRow } from './BudgetRow';
import type { Budget } from '../services/budgets.service';

interface Props {
  budgets: Budget[];
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export const BudgetList = ({ budgets, onEdit, onDelete }: Props) => {
  if (!budgets || budgets.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <p className="text-gray-500">
          No hay presupuestos configurados para este mes.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {budgets.map((rootBudget) => (
        // Renderizamos solo los padres raíz. Ellos se encargan de sus hijos.
        <BudgetRow
          key={rootBudget.categoryId}
          budget={rootBudget}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
