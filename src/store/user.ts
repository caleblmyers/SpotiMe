import { defineStore } from "pinia";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";

interface SpotifyProfile {
  id: string;
  display_name: string;
  email?: string;
  images?: Array<{ url: string }>;
}

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
    setSpotifyProfile(profile: SpotifyProfile): void {
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
            localStorage.setItem("spotify_refresh_token", res.data.refresh_token);
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
      const accessToken = localStorage.getItem("spotify_access_token");
      if (!accessToken) {
        throw new Error("No access token found");
      }

      const spotifyId = this.id;
      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
      };
      if (spotifyId) {
        headers["x-spotify-id"] = spotifyId;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/api/me`, {
          headers,
          withCredentials: true,
        });
        
        // Ensure the response has the required data
        if (!res.data || !res.data.id) {
          throw new Error("Invalid profile response: missing id");
        }
        
        this.setSpotifyProfile(res.data);
        
        // Verify the profile was set correctly
        if (!this.id || this.id !== res.data.id) {
          throw new Error("Failed to set user profile in store");
        }
      } catch (err: unknown) {
        // If token is invalid, try to refresh
        const error = err as { response?: { status: number }; message?: string };
        if (error.response?.status === 401) {
          const newToken = await this.refreshAccessToken();
          if (newToken) {
            // Retry with new token
            const retryHeaders: Record<string, string> = {
              Authorization: `Bearer ${newToken}`,
            };
            if (spotifyId) {
              retryHeaders["x-spotify-id"] = spotifyId;
            }
            const retryRes = await axios.get(`${API_BASE_URL}/api/me`, {
              headers: retryHeaders,
              withCredentials: true,
            });
            
            if (!retryRes.data || !retryRes.data.id) {
              throw new Error("Invalid profile response after refresh: missing id");
            }
            
            this.setSpotifyProfile(retryRes.data);
            
            // Verify the profile was set correctly
            if (!this.id || this.id !== retryRes.data.id) {
              throw new Error("Failed to set user profile in store after refresh");
            }
            return;
          }
        }
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
