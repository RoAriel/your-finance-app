import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../services/categories.service';
import type {
  CreateCategoryDTO,
  UpdateCategoryDTO,
  CategoryType,
} from '../types';

// 1. Hook para OBTENER (Lectura)
export const useCategories = (type?: CategoryType) => {
  const query = useQuery({
    // 👇 FIX: Agregamos 'type' a la key. Esto arregla el linter y mejora el caching.
    queryKey: ['categories', { type }],
    queryFn: () => categoriesService.getAll({ limit: 100 }), // Nota: Si tu servicio soporta filtrado por query params, pásalo aquí. Si filtra en frontend, está bien así.
    staleTime: 1000 * 60 * 10,
  });

  return {
    // Si el servicio devuelve paginado { data: [], meta: ... }, accedemos a .data
    // Si devuelve array directo, ajustamos. Según tu código anterior era PaginatedResponse.
    categories: query.data?.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// 2. Hook para CREAR
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDTO) => categoriesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// 3. Hook para ACTUALIZAR
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDTO }) =>
      categoriesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// 4. Hook para ELIMINAR
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
