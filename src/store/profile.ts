import { defineStore } from 'pinia';
import { makeAuthenticatedRequest } from '../composables/useApi';
import type { SpotifyUser } from '../types/spotify';

interface ProfileState {
  profile: SpotifyUser | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useProfileStore = defineStore('profile', {
  state: (): ProfileState => ({
    profile: null,
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
    async fetchProfile(force = false): Promise<void> {
      // Use cached data if available and not stale, unless forced
      if (!force && this.profile && !this.isStale) {
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const profile = await makeAuthenticatedRequest<SpotifyUser>(
          '/api/me',
          undefined,
          false // Don't use sessionStorage cache, use store cache instead
        );

        if (!profile || !profile.id) {
          throw new Error('Invalid profile response: missing id');
        }

        this.profile = profile;
        this.lastFetched = Date.now();
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
        this.error =
          errorObj.response?.data?.message ||
          errorObj.message ||
          'Failed to fetch profile';
        console.error('Error fetching profile:', err);
        this.profile = null;
      } finally {
        this.isLoading = false;
      }
    },

    clearProfile(): void {
      this.profile = null;
      this.error = null;
      this.lastFetched = null;
    },
  },
});

