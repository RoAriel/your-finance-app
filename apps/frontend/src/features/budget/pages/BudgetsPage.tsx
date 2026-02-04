import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';
import { BudgetCard } from '../components/BudgetCard';
import { CreateBudgetModal } from '../components/CreateBudgetModal';
import type { Budget } from '../services/budgets.service';
import { useConfirm } from '../../../context/ConfirmContext';

export const BudgetsPage = () => {
  // 1. Estados para Fecha (Mes y Año) - Soluciona error 'selectedMonth/Year'
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // 2. Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Unificamos el nombre: usaremos 'editingBudget' en todo el archivo
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // 3. Hooks y Datos
  const { budgets, isLoading, deleteBudget, refetch } = useBudgets(
    selectedMonth,
    selectedYear
  );
  const { confirm } = useConfirm();

  // --- HANDLERS ---
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleOpenCreate = () => {
    setEditingBudget(null); // Limpiamos para crear uno nuevo
    setIsModalOpen(true);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget); // Cargamos el presupuesto a editar
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    confirm({
      title: '¿Eliminar Presupuesto?',
      message:
        'Esta acción eliminará el límite de gasto para esta categoría en este mes.',
      variant: 'danger',
      onConfirm: async () => {
        await deleteBudget(id);
      },
    });
  };

  // Nombres de meses para mostrar
  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header con Navegación de Fecha */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Presupuestos</h1>
          <p className="text-gray-500">Controla tus límites de gasto mensual</p>
        </div>

        <div className="flex items-center gap-4 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-gray-800 min-w-35 text-center">
            {monthNames[selectedMonth - 1]} {selectedYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary-hover transition-colors font-medium shadow-sm"
        >
          <Plus size={20} />
          <span>Nuevo Presupuesto</span>
        </button>
      </div>

      {/* Grid de Presupuestos */}
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-20">
          {budgets?.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

          {(!budgets || budgets.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <p>No tienes presupuestos definidos para este mes.</p>
              <button
                onClick={handleOpenCreate}
                className="text-primary font-medium hover:underline mt-2"
              >
                Crear el primero
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal - AQUÍ CORREGIMOS LOS ERRORES */}
      {isModalOpen && (
        <CreateBudgetModal
          // 👇 LA CLAVE MÁGICA: Reinicia el modal si cambiamos de 'editar X' a 'nuevo'
          key={editingBudget ? editingBudget.id : 'new-budget'}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          // 👇 CORRECCIÓN: Usamos la variable de estado correcta 'editingBudget'
          budgetToEdit={editingBudget}
          // 👇 CORRECCIÓN: Pasamos los estados de mes/año que definimos arriba
          initialMonth={selectedMonth}
          initialYear={selectedYear}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
};
