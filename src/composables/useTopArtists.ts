import { onMounted } from "vue";
import { useApi } from "./useApi";
import type { SpotifyArtist } from "../types/spotify";
import type { TimeRange } from "../types/spotify";

export interface TopArtistsParams {
  limit?: number;
  offset?: number;
  time_range?: TimeRange;
}

export function useTopArtists(defaultParams?: TopArtistsParams) {
  const { data, isLoading, error, fetchData } = useApi<SpotifyArtist[]>(
    "/api/top-artists",
    defaultParams as Record<string, unknown> | undefined
  );

  // Auto-fetch on mount
  onMounted(() => {
    if (!data.value) {
      fetchData(defaultParams as Record<string, unknown> | undefined);
    }
  });

  return {
    artists: data,
    isLoading,
    error,
    fetchTopArtists: (params?: TopArtistsParams) =>
      fetchData(params as Record<string, unknown> | undefined),
  };
}
