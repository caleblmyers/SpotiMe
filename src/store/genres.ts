import { defineStore } from 'pinia';
import { makeAuthenticatedRequest } from '../composables/useApi';
import type { SpotifyGenresResponse } from '../types/spotify';

interface GenresState {
  genres: string[];
  genresResponse: SpotifyGenresResponse | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (genres change less frequently)

export const useGenresStore = defineStore('genres', {
  state: (): GenresState => ({
    genres: [],
    genresResponse: null,
    isLoading: false,
    error: null,
    lastFetched: null,
  }),

  getters: {
    isStale: (state): boolean => {
      if (!state.lastFetched) return true;
      return Date.now() - state.lastFetched > CACHE_DURATION;
    },
  },

  actions: {
    async fetchGenres(force = false): Promise<void> {
      // Use cached data if available and not stale, unless forced
      if (!force && this.genres.length > 0 && !this.isStale) {
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const response = await makeAuthenticatedRequest<SpotifyGenresResponse>(
          '/api/genres',
          undefined,
          false // Don't use sessionStorage cache, use store cache instead
        );

        this.genresResponse = response;
        this.genres = response?.genres ?? [];
        this.lastFetched = Date.now();
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
        this.error =
          errorObj.response?.data?.message ||
          errorObj.message ||
          'Failed to fetch genres';
        console.error('Error fetching genres:', err);
        this.genres = [];
        this.genresResponse = null;
      } finally {
        this.isLoading = false;
      }
    },

    clearGenres(): void {
      this.genres = [];
      this.genresResponse = null;
      this.error = null;
      this.lastFetched = null;
    },
  },
});

