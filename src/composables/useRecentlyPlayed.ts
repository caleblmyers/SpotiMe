import { computed } from 'vue';
import { useApi } from './useApi';
import type { SpotifyTrack } from '../types/spotify';

export interface RecentlyPlayedParams {
  limit?: number;
}

export interface RecentlyPlayedResponse {
  items: Array<{
    track: SpotifyTrack;
    played_at: string;
  }>;
}

export function useRecentlyPlayed(defaultParams?: RecentlyPlayedParams) {
  const { data, isLoading, error, fetchData } = useApi<RecentlyPlayedResponse>(
    '/api/recently-played',
    defaultParams as Record<string, unknown> | undefined
  );

  // Fetch on mount
  fetchData(defaultParams as Record<string, unknown> | undefined);

  // Extract tracks with played_at timestamps from response
  const tracks = computed(() => {
    if (!data.value) return [];
    // Handle both response formats: { items: [...] } or direct array
    if (Array.isArray(data.value)) {
      return data.value.map((item: any) => ({
        track: item.track || item,
        played_at: item.played_at || null,
      }));
    }
    if (data.value.items && Array.isArray(data.value.items)) {
      return data.value.items.map((item: any) => ({
        track: item.track || item,
        played_at: item.played_at || null,
      }));
    }
    return [];
  });

  return {
    recentlyPlayed: data,
    tracks,
    isLoading,
    error,
    fetchRecentlyPlayed: (params?: RecentlyPlayedParams) =>
      fetchData(params as Record<string, unknown> | undefined),
  };
}

