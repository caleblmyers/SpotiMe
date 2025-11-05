import { computed } from 'vue';
import { useApi } from './useApi';
import type { SpotifyAlbumsResponse, SpotifyAlbumResponse } from '../types/spotify';

export interface AlbumsParams {
  ids: string | string[];
}

export function useAlbums() {
  const { data, isLoading, error, fetchData } = useApi<SpotifyAlbumsResponse>(
    '/api/albums'
  );

  // Computed property to extract albums array from response
  const albums = computed<SpotifyAlbumResponse[]>(() => data.value?.albums ?? []);

  return {
    albums,
    albumsResponse: data,
    isLoading,
    error,
    fetchAlbums: (albumIds: string | string[]) => {
      const ids = Array.isArray(albumIds) ? albumIds.join(',') : albumIds;
      return fetchData({ ids });
    },
  };
}

