import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type UserProfile, type BrandProfile, type Product, type SocialPost, type ScheduledPost, PostStatus, ExternalBlob } from '../backend';

// ── User Profile ─────────────────────────────────────────────────────────────

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

// ── Brand Profile ─────────────────────────────────────────────────────────────

export function useGetBrandProfile(brandId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BrandProfile | null>({
    queryKey: ['brandProfile', brandId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBrandProfile(brandId);
    },
    enabled: !!actor && !actorFetching && !!brandId,
    retry: false,
  });
}

export function useCreateBrandProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      brandId: string;
      name: string;
      logo: ExternalBlob;
      tone: string;
      audience: string;
      categories: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBrandProfile(
        params.brandId,
        params.name,
        params.logo,
        params.tone,
        params.audience,
        params.categories
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brandProfile', variables.brandId] });
    },
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { brandId: string; product: Product }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProduct(params.brandId, params.product);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brandProfile', variables.brandId] });
    },
  });
}

// ── Content Generation ────────────────────────────────────────────────────────

export function useGeneratePost() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (params: { brandId: string; productIdx: number; platform: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.generatePost(params.brandId, BigInt(params.productIdx), params.platform);
    },
  });
}

// ── Scheduled Posts ───────────────────────────────────────────────────────────

export function useGetScheduledPosts(brandId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ScheduledPost[]>({
    queryKey: ['scheduledPosts', brandId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getScheduledPosts(brandId);
    },
    enabled: !!actor && !actorFetching && !!brandId,
  });
}

export function useSchedulePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { brandId: string; post: SocialPost; scheduledTime: Date }) => {
      if (!actor) throw new Error('Actor not available');
      const timeNs = BigInt(params.scheduledTime.getTime()) * BigInt(1_000_000);
      return actor.schedulePost(params.brandId, params.post, timeNs);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts', variables.brandId] });
    },
  });
}

export function useUpdatePostStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { postId: string; status: PostStatus; brandId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePostStatus(params.postId, params.status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts', variables.brandId] });
    },
  });
}

export function useDeleteScheduledPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { postId: string; brandId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteScheduledPost(params.postId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scheduledPosts', variables.brandId] });
    },
  });
}
