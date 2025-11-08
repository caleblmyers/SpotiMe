import { defineStore } from "pinia";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";
import type { SpotifyUser } from "../types/spotify";
import { getAccessToken } from "../utils/auth";

interface UserState {
  id: string | null;
  displayName: string | null;
  email: string | null;
  images: Array<{ url: string }> | null;
  accessToken: string | null;
  isRestoringAuth: boolean;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    id: null,
    displayName: null,
    email: null,
    images: null,
    accessToken: getAccessToken(),
    isRestoringAuth: false,
  }),
  getters: {
    isAuthenticated: (state): boolean => {
      const token = state.accessToken || getAccessToken();
      return !!token && !!state.id;
    },
  },
  actions: {
    setSpotifyProfile(profile: SpotifyUser): void {
      this.id = profile.id;
      this.displayName = profile.display_name || null;
      this.email = profile.email || null;
      this.images = profile.images || null;
    },
    setSpotifyTokens(accessToken: string, refreshToken?: string): void {
      this.accessToken = accessToken;
      localStorage.setItem("spotify_access_token", accessToken);
      if (refreshToken) {
        localStorage.setItem("spotify_refresh_token", refreshToken);
      }
    },
    async refreshAccessToken(): Promise<string | null> {
      const { getRefreshToken } = await import("../utils/auth");
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        this.clearUser();
        return null;
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const newAccessToken = res.data.access_token;
        if (newAccessToken) {
          this.accessToken = newAccessToken;
          localStorage.setItem("spotify_access_token", newAccessToken);
          if (res.data.refresh_token) {
            localStorage.setItem(
              "spotify_refresh_token",
              res.data.refresh_token
            );
          }
          return newAccessToken;
        }
      } catch (err) {
        console.error("Failed to refresh token:", err);
        this.clearUser();
      }
      return null;
    },
    async fetchSpotifyProfile(): Promise<void> {
      try {
        const { useProfileStore } = await import('./profile');
        const profileStore = useProfileStore();
        await profileStore.fetchProfile(true);

        const profile = profileStore.profile;
        if (!profile || !profile.id) {
          throw new Error("Invalid profile response: missing id");
        }

        this.setSpotifyProfile(profile);

        if (!this.id || this.id !== profile.id) {
          throw new Error("Failed to set user profile in store");
        }
      } catch (err: unknown) {
        this.clearUser();
        throw err;
      }
    },
    clearUser(): void {
      this.id = null;
      this.displayName = null;
      this.email = null;
      this.images = null;
      this.accessToken = null;
      localStorage.removeItem("spotify_access_token");
      localStorage.removeItem("spotify_refresh_token");
      
      // Clear profile store as well
      import('./profile').then(({ useProfileStore }) => {
        const profileStore = useProfileStore();
        profileStore.clearProfile();
      });
    },
  },
});
