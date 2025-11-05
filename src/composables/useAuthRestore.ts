import { onMounted } from 'vue';
import { useUserStore } from '../store/user';

export function useAuthRestore() {
  const user = useUserStore();

  onMounted(async () => {
    // Check if user is already authenticated on app load
    const accessToken = localStorage.getItem("spotify_access_token");
    if (accessToken && !user.isAuthenticated) {
      try {
        await user.fetchSpotifyProfile();
      } catch (err) {
        console.error("Failed to fetch Spotify profile:", err);
      }
    }
  });
}

