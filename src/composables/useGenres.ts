import { computed, onMounted } from 'vue';
import { useApi } from './useApi';
import type { SpotifyGenresResponse } from '../types/spotify';

export function useGenres() {
  const { data, isLoading, error, fetchData } = useApi<SpotifyGenresResponse>(
    '/api/genres'
  );

  // Auto-fetch on mount
  onMounted(() => {
    if (!data.value) {
      fetchData();
    }
  });

  // Computed property to extract genres array from response
  const genres = computed<string[]>(() => data.value?.genres ?? []);

  return {
    genres,
    genresResponse: data,
    isLoading,
    error,
    fetchGenres: fetchData,
  };
}

