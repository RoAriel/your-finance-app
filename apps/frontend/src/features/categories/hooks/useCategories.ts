import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../services/categories.service';
import { categoryKeys } from '../keys'; // 👈 Importamos las llaves
import type {
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryType,
} from '../types';

interface UseCategoriesProps {
  type?: CategoryType; // Filtro opcional
  search?: string;
}

export const useCategories = (overrides?: UseCategoriesProps) => {
  const queryClient = useQueryClient();

  // 1. Estado local (si quisieras paginar o filtrar desde la UI)
  const [internalFilters, setInternalFilters] = useState({
    page: 1,
    limit: 100, // Traemos muchas por defecto para selectores
    search: '',
    type: undefined as CategoryType | undefined,
  });

  const activeFilters = { ...internalFilters, ...overrides };

  // 2. QUERY (Lectura)
  const query = useQuery({
    queryKey: categoryKeys.list(
      activeFilters as unknown as Record<string, unknown>
    ),
    queryFn: () => categoriesService.getAll(activeFilters),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 5, // 5 minutos (las categorías no cambian tanto)
  });

  // 3. MUTACIONES (Escritura)

  // Crear
  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryDTO) => categoriesService.create(data),
    onSuccess: () => {
      // 👇 Invalidamos todo para que se actualicen las listas en selectores y tablas
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });

  // Actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDTO }) =>
      categoriesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      // Si cambias el nombre de una categoría, invalidamos transacciones para que se refleje
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  // Eliminar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  return {
    // Datos
    ...query,
    categories: query.data?.data || [], // Array limpio
    meta: query.data?.meta,

    // Acciones
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,

    // Estados de carga de acciones
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Filtros
    filters: internalFilters,
    setFilters: setInternalFilters,
  };
};
