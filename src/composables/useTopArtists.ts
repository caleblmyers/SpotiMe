import { watch, type Ref } from "vue";
import { useApi } from "./useApi";
import type { SpotifyArtist } from "../types/spotify";
import type { TimeRange } from "../types/spotify";

export interface TopArtistsParams {
  limit?: number;
  offset?: number;
  time_range?: TimeRange;
}

export function useTopArtists(defaultParams?: TopArtistsParams, watchTimeRange?: Ref<TimeRange>) {
  const { data, isLoading, error, fetchData } = useApi<SpotifyArtist[]>(
    "/api/top-artists",
    defaultParams as Record<string, unknown> | undefined
  );

  // Watch for time range changes if provided
  if (watchTimeRange) {
    watch(
      watchTimeRange,
      (newTimeRange) => {
        const params: TopArtistsParams = {
          ...defaultParams,
          time_range: newTimeRange,
        };
        fetchData(params as Record<string, unknown> | undefined);
      },
      { immediate: true }
    );
  } else if (defaultParams?.time_range) {
    // If no watcher provided but default params have time_range, fetch immediately
    fetchData(defaultParams as Record<string, unknown> | undefined);
  }

  return {
    artists: data,
    isLoading,
    error,
    fetchTopArtists: (params?: TopArtistsParams) =>
      fetchData(params as Record<string, unknown> | undefined),
  };
}
