import { onMounted } from 'vue';
import { useApi } from './useApi';
import type { SpotifyUser } from '../types/spotify';

export function useProfile() {
  const { data, isLoading, error, fetchData } = useApi<SpotifyUser>('/api/me');

  // Auto-fetch on mount
  onMounted(() => {
    if (!data.value) {
      fetchData();
    }
  });

  return {
    profile: data,
    isLoading,
    error,
    fetchProfile: fetchData,
  };
}

