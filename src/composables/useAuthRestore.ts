import { onMounted } from 'vue';
import { useUserStore } from '../store/user';
import { hasAccessToken } from '../utils/auth';

/**
 * Composable to restore authentication state on app load
 * Prevents flash of unauthenticated UI by setting isRestoringAuth flag
 */
export function useAuthRestore() {
  const user = useUserStore();

  /**
   * Restore authentication if token exists but user is not authenticated
   */
  async function restoreAuth(): Promise<void> {
    if (hasAccessToken() && !user.isAuthenticated) {
      user.isRestoringAuth = true;
      try {
        await user.fetchSpotifyProfile();
      } catch (err) {
        console.error("Failed to fetch Spotify profile:", err);
      } finally {
        user.isRestoringAuth = false;
      }
    }
  }

  onMounted(() => {
    restoreAuth();
  });

  return {
    restoreAuth,
  };
}

