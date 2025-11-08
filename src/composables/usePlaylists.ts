import { useApi } from "./useApi";
import type { SpotifyPlaylist, PaginatedResponse } from "../types/spotify";

export interface PlaylistsParams {
  limit?: number;
  offset?: number;
}

export function usePlaylists(defaultParams?: PlaylistsParams) {
  const { data, isLoading, error, fetchData } = useApi<PaginatedResponse<SpotifyPlaylist>>(
    "/api/playlists",
    defaultParams as Record<string, unknown> | undefined
  );

  // Fetch immediately if default params provided
  if (defaultParams) {
    fetchData(defaultParams as Record<string, unknown> | undefined);
  }

  return {
    playlists: data,
    isLoading,
    error,
    fetchPlaylists: (params?: PlaylistsParams) =>
      fetchData(params as Record<string, unknown> | undefined),
  };
}

