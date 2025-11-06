import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useGenresStore } from '../store/genres';

export function useGenres() {
  const genresStore = useGenresStore();
  const { genres, genresResponse, isLoading, error } = storeToRefs(genresStore);

  // Auto-fetch on mount if not cached
  onMounted(() => {
    genresStore.fetchGenres();
  });

  return {
    genres,
    genresResponse,
    isLoading,
    error,
    fetchGenres: (force = false) => genresStore.fetchGenres(force),
  };
}

