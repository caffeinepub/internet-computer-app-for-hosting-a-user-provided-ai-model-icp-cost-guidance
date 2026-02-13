import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Model, ModelMetadataUpdate, UserProfile } from '../backend';

export function useGetMyModels() {
  const { actor, isFetching } = useActor();

  return useQuery<Model[]>({
    queryKey: ['myModels'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyModels();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAvailableModels() {
  const { actor, isFetching } = useActor();

  return useQuery<Model[]>({
    queryKey: ['availableModels'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableModels();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateModelMetadata() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (modelUpdate: ModelMetadataUpdate) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateModelMetadata(modelUpdate);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myModels'] });
      queryClient.invalidateQueries({ queryKey: ['availableModels'] });
    },
  });
}

export function useDeleteModel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (modelId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteModel(modelId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myModels'] });
      queryClient.invalidateQueries({ queryKey: ['availableModels'] });
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
