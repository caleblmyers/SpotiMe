import { defineStore } from "pinia";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";

interface UserState {
  email: string | null;
  id: string | null;
  spotifyId: string | null;
  displayName: string | null;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    email: null,
    id: null,
    spotifyId: null,
    displayName: null,
  }),
  actions: {
    setUserData(email: string, userData?: any) {
      this.email = email;
      if (userData) {
        this.id = userData.id;
        this.spotifyId = userData.spotifyId || userData.id || null;
        this.displayName =
          userData.displayName || userData.display_name || null;
      }
    },
    async fetchCurrentUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/auth/me`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.email = res.data.email;
        this.id = res.data.id;
        this.spotifyId = res.data.spotifyId;
        this.displayName = res.data.displayName;
        return res.data;
      } catch (err) {
        // If token is invalid, clear it
        localStorage.removeItem("token");
        this.clearUser();
        throw err;
      }
    },
    async fetchUser() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/auth/me`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.email = res.data.email;
        this.id = res.data.id;
        this.spotifyId = res.data.spotifyId;
        this.displayName = res.data.displayName;
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    },
    clearUser() {
      this.email = null;
      this.id = null;
      this.spotifyId = null;
      this.displayName = null;
      localStorage.removeItem("token");
    },
  },
});
