import { useApi } from "./useApi";
import type { SpotifyPlaylistTrack, PaginatedResponse } from "../types/spotify";

export interface PlaylistTracksParams {
  limit?: number;
  offset?: number;
}

export function usePlaylistTracks(playlistId: string, defaultParams?: PlaylistTracksParams) {
  const { data, isLoading, error, fetchData } = useApi<PaginatedResponse<SpotifyPlaylistTrack>>(
    `/api/playlists/${playlistId}/tracks`,
    defaultParams as Record<string, unknown> | undefined
  );

  // Fetch immediately if default params provided
  if (defaultParams) {
    fetchData(defaultParams as Record<string, unknown> | undefined);
  }

  return {
    tracks: data,
    isLoading,
    error,
    fetchPlaylistTracks: (params?: PlaylistTracksParams) =>
      fetchData(params as Record<string, unknown> | undefined),
  };
}

