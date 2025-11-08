import { useApi } from "./useApi";
import type { SpotifyPlaylist, PlaylistSearchResult, TimeRange } from "../types/spotify";

export interface PlaylistSearchByTrackParams {
  track_id: string;
}

export interface PlaylistSearchByArtistParams {
  artist_id: string;
}

export interface PlaylistAnalyzeTopParams {
  analyze_top: true;
  time_range?: TimeRange;
}

export type PlaylistSearchParams = 
  | PlaylistSearchByTrackParams 
  | PlaylistSearchByArtistParams 
  | PlaylistAnalyzeTopParams;

export function usePlaylistSearch() {
  const { data, isLoading, error, fetchData } = useApi<SpotifyPlaylist[] | PlaylistSearchResult[]>(
    "/api/playlists/search"
  );

  return {
    results: data,
    isLoading,
    error,
    searchByTrack: (trackId: string) =>
      fetchData({ track_id: trackId } as Record<string, unknown> | undefined),
    searchByArtist: (artistId: string) =>
      fetchData({ artist_id: artistId } as Record<string, unknown> | undefined),
    analyzeTop: (timeRange?: TimeRange) =>
      fetchData({ analyze_top: true, time_range: timeRange } as Record<string, unknown> | undefined),
  };
}

