import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Poem } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
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

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// Poumai Poems Queries
export function usePoems() {
  const { actor, isFetching } = useActor();

  return useQuery<Poem[]>({
    queryKey: ['poems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPoems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePoemsByCategory(category: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Poem[]>({
    queryKey: ['poems', 'category', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPoemsByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

export function useCreatePoem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      author,
      poemText,
      dateWritten,
      category,
      englishTranslation,
      culturalContext,
    }: {
      title: string;
      author: string;
      poemText: string;
      dateWritten: string;
      category: string;
      englishTranslation: string | null;
      culturalContext: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPoem(
        title,
        author,
        poemText,
        dateWritten,
        category,
        englishTranslation,
        culturalContext
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poems'] });
    },
  });
}

export function useUpdatePoem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      author,
      poemText,
      dateWritten,
      category,
      englishTranslation,
      culturalContext,
    }: {
      id: bigint;
      title: string;
      author: string;
      poemText: string;
      dateWritten: string;
      category: string;
      englishTranslation: string | null;
      culturalContext: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePoem(
        id,
        title,
        author,
        poemText,
        dateWritten,
        category,
        englishTranslation,
        culturalContext
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poems'] });
    },
  });
}

export function useDeletePoem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePoem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['poems'] });
    },
  });
}
