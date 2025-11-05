import { onMounted } from "vue";
import { useApi } from "./useApi";
import type { SpotifyTrack } from "../types/spotify";
import type { TimeRange } from "../types/spotify";

export interface TopTracksParams {
  limit?: number;
  offset?: number;
  time_range?: TimeRange;
}

export function useTopTracks(defaultParams?: TopTracksParams) {
  const { data, isLoading, error, fetchData } = useApi<SpotifyTrack[]>(
    "/api/top-tracks",
    defaultParams as Record<string, unknown> | undefined
  );

  // Auto-fetch on mount
  onMounted(() => {
    if (!data.value) {
      fetchData(defaultParams as Record<string, unknown> | undefined);
    }
  });

  return {
    tracks: data,
    isLoading,
    error,
    fetchTopTracks: (params?: TopTracksParams) =>
      fetchData(params as Record<string, unknown> | undefined),
  };
}
