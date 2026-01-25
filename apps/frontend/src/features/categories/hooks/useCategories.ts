import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '../services/categories.service';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll,
    // Como las categorías son datos estáticos, las guardamos en caché por 10 minutos
    staleTime: 1000 * 60 * 10,
  });
};
