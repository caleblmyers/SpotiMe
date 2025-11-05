import { defineStore } from "pinia";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";
import { makeAuthenticatedRequest } from "../composables/useApi";
import type { SpotifyUser } from "../types/spotify";

interface UserState {
  id: string | null;
  displayName: string | null;
  email: string | null;
  images: Array<{ url: string }> | null;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    id: null,
    displayName: null,
    email: null,
    images: null,
  }),
  getters: {
    isAuthenticated: (state): boolean => {
      const accessToken = localStorage.getItem("spotify_access_token");
      return !!accessToken && !!state.id;
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
      localStorage.setItem("spotify_access_token", accessToken);
      if (refreshToken) {
        localStorage.setItem("spotify_refresh_token", refreshToken);
      }
    },
    async refreshAccessToken(): Promise<string | null> {
      const refreshToken = localStorage.getItem("spotify_refresh_token");
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
        // Use the same authenticated request function as the composable
        // Don't use cache for store to ensure fresh data
        const profile = await makeAuthenticatedRequest<SpotifyUser>(
          "/api/me",
          undefined,
          false
        );

        // Ensure the response has the required data
        if (!profile || !profile.id) {
          throw new Error("Invalid profile response: missing id");
        }

        this.setSpotifyProfile(profile);

        // Verify the profile was set correctly
        if (!this.id || this.id !== profile.id) {
          throw new Error("Failed to set user profile in store");
        }
      } catch (err: unknown) {
        // If refresh fails or other error, clear user
        this.clearUser();
        throw err;
      }
    },
    clearUser(): void {
      this.id = null;
      this.displayName = null;
      this.email = null;
      this.images = null;
      localStorage.removeItem("spotify_access_token");
      localStorage.removeItem("spotify_refresh_token");
    },
  },
});
