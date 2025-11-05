import { onMounted } from 'vue';
import { getTopTracks } from '../api/spotify';
import { useAsyncData } from './useAsyncData';

interface Track {
  id: string;
  name: string;
  duration_ms: number;
  album?: {
    name: string;
  };
}

export function useTopTracks() {
  const { data: tracks, loading, error, execute } = useAsyncData<Track>();

  async function fetchTopTracks(): Promise<void> {
    await execute(() => getTopTracks() as Promise<Track[]>, 'Failed to fetch top tracks');
  }

  onMounted(() => {
    fetchTopTracks();
  });

  return {
    tracks,
    loading,
    error,
    fetchTopTracks,
  };
}

