import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { parseTokensFromUrl } from "../api/spotify";
import { useUserStore } from "../store/user";

/**
 * Composable to handle Spotify OAuth callback
 * Parses tokens from URL, stores them, and fetches user profile
 */
export function useAuthCallback() {
  const router = useRouter();
  const user = useUserStore();

  const loading = ref(true);
  const error = ref<string | null>(null);
  const success = ref(false);

  async function handleCallback(): Promise<void> {
    try {
      const tokens = parseTokensFromUrl();

      if (!tokens) {
        throw new Error("No tokens found in callback URL");
      }

      user.setSpotifyTokens(tokens.access_token, tokens.refresh_token);

      // Set ID directly if provided to ensure isAuthenticated works before fetching full profile
      if (tokens.spotify_id) {
        user.id = tokens.spotify_id;
      }

      await user.fetchSpotifyProfile();
      await nextTick();

      loading.value = false;
      success.value = true;
    } catch (err) {
      console.error("Failed to handle Spotify callback:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "Failed to complete authentication";
      loading.value = false;
    }
  }

  async function redirectToHome(): Promise<void> {
    await nextTick();
    router.replace("/");
  }

  onMounted(() => {
    handleCallback();
  });

  return {
    loading,
    error,
    success,
    redirectToHome,
  };
}
