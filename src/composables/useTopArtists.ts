import { onMounted } from 'vue';
import { getTopArtists } from '../api/spotify';
import { useAsyncData } from './useAsyncData';

interface Artist {
  id: string;
  name: string;
  images?: Array<{ url: string }>;
  genres?: string[];
}

export function useTopArtists() {
  const { data: artists, loading, error, execute } = useAsyncData<Artist>();

  async function fetchTopArtists(): Promise<void> {
    await execute(() => getTopArtists() as Promise<Artist[]>, 'Failed to fetch top artists');
  }

  onMounted(() => {
    fetchTopArtists();
  });

  return {
    artists,
    loading,
    error,
    fetchTopArtists,
  };
}

