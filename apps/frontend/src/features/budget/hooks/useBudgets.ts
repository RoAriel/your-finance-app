import { useState, useEffect, useCallback } from 'react';
import { budgetsService } from '../services/budgets.service';
import type {
  Budget,
  CreateBudgetDTO,
  UpdateBudgetDTO,
} from '../services/budgets.service';

export const useBudgets = (month: number, year: number) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Cargar datos (Se ejecuta al montar y cuando cambia month/year)
  const fetchBudgets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await budgetsService.findAll(month, year);
      setBudgets(data);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError('No se pudieron cargar los presupuestos.');
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  // 2. Efecto disparador
  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  // --- CRUD METHODS ---

  const createBudget = async (dto: CreateBudgetDTO) => {
    try {
      const newBudget = await budgetsService.create(dto);
      // Recargamos para ver el nuevo presupuesto reflejado
      await fetchBudgets();
      return newBudget;
    } catch (err) {
      console.error('Error creating budget:', err);
      throw err;
    }
  };

  const updateBudget = async (id: string, dto: UpdateBudgetDTO) => {
    try {
      const updated = await budgetsService.update(id, dto);
      await fetchBudgets();
      return updated;
    } catch (err) {
      console.error('Error updating budget:', err);
      throw err;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      await budgetsService.delete(id);
      // Actualizamos estado local
      setBudgets((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Error deleting budget:', err);
      throw err;
    }
  };

  return {
    budgets,
    isLoading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    refetch: fetchBudgets,
  };
};
