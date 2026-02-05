import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, type UpdateUserDto } from '../services/users.service';
import { useAuth } from '../../auth/hooks/useAuth'; // 👇 Importamos el Auth

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { updateLocalUser } = useAuth(); // 👇 Sacamos la función mágica

  const query = useQuery({
    queryKey: ['user-profile'],
    queryFn: usersService.getProfile,
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserDto) => usersService.updateProfile(data),
    onSuccess: (updatedUser) => {
      // 1. Actualizamos caché de React Query
      queryClient.setQueryData(['user-profile'], updatedUser);

      // 2. 👇 Actualizamos el Contexto Global (Sidebar, Header, etc.)
      updateLocalUser(updatedUser);
    },
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
