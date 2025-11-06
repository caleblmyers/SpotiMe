import { watch, type Ref } from "vue";
import { useApi } from "./useApi";
import type { SpotifyTrack } from "../types/spotify";
import type { TimeRange } from "../types/spotify";

export interface TopTracksParams {
  limit?: number;
  offset?: number;
  time_range?: TimeRange;
}

export function useTopTracks(defaultParams?: TopTracksParams, watchTimeRange?: Ref<TimeRange>) {
  const { data, isLoading, error, fetchData } = useApi<SpotifyTrack[]>(
    "/api/top-tracks",
    defaultParams as Record<string, unknown> | undefined
  );

  // Watch for time range changes if provided
  if (watchTimeRange) {
    watch(
      watchTimeRange,
      (newTimeRange) => {
        const params: TopTracksParams = {
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
    tracks: data,
    isLoading,
    error,
    fetchTopTracks: (params?: TopTracksParams) =>
      fetchData(params as Record<string, unknown> | undefined),
  };
}
