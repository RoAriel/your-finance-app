import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../services/categories.service';
import type { CreateCategoryDTO, UpdateCategoryDTO } from '../types';

export const useCategories = () => {
  const queryClient = useQueryClient();

  // 1. EL QUERY (Lo que tenías antes)
  const query = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
    // ¡Mantenemos tu optimización! 🚀
    staleTime: 1000 * 60 * 10, // 10 minutos sin volver a pedir al servidor
  });

  // 2. MUTACIÓN: CREAR
  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryDTO) => categoriesService.create(data),
    onSuccess: () => {
      // Al crear, invalidamos la caché para que se refresque la lista
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // 3. MUTACIÓN: ACTUALIZAR
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDTO }) =>
      categoriesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // 4. MUTACIÓN: ELIMINAR
  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  // 5. RETORNO UNIFICADO
  return {
    // Esparcimos (...) todas las propiedades del query (data, isLoading, error, etc.)
    ...query,

    // Agregamos las funciones manuales
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,

    // (Opcional) Estados de carga específicos de las acciones
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
