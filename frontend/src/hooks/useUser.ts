import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../services/api';
import { User } from '../types';
import { useAuthStore } from '../store/auth.store';

export function useUser() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => usersApi.me(),
    staleTime: 600000,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (updates: Partial<User>) => usersApi.update(updates),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
      setUser(updatedUser);
    },
  });
}
