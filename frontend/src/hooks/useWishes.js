import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createWishRequest,
  listMyWishesRequest,
  getWishRequest,
  updateWishRequest,
  publishWishRequest,
  unpublishWishRequest,
  deleteWishRequest,
} from '../api/wish.api';

export const useMyWishes = (params = {}) => {
  return useQuery({
    queryKey: ['wishes', 'mine', params],
    queryFn: () => listMyWishesRequest(params),
    select: (data) => data?.data,
  });
};

export const useWish = (id) => {
  return useQuery({
    queryKey: ['wishes', id],
    queryFn: () => getWishRequest(id),
    select: (data) => data?.data?.wish,
    enabled: Boolean(id),
  });
};

export const useCreateWish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWishRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishes', 'mine'] }),
  });
};

export const useUpdateWish = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateWishRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishes', id] });
      queryClient.invalidateQueries({ queryKey: ['wishes', 'mine'] });
    },
  });
};

export const usePublishWish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: publishWishRequest,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['wishes', id] });
      queryClient.invalidateQueries({ queryKey: ['wishes', 'mine'] });
    },
  });
};

export const useUnpublishWish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unpublishWishRequest,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['wishes', id] });
      queryClient.invalidateQueries({ queryKey: ['wishes', 'mine'] });
    },
  });
};

export const useDeleteWish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWishRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishes', 'mine'] }),
  });
};

export default {
  useMyWishes,
  useWish,
  useCreateWish,
  useUpdateWish,
  usePublishWish,
  useUnpublishWish,
  useDeleteWish,
};
