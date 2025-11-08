import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { parseTokensFromUrl } from "../api/spotify";
import { useUserStore } from "../store/user";

export function useAuthCallback() {
  const router = useRouter();
  const user = useUserStore();

  const loading = ref(true);
  const error = ref<string | null>(null);
  const success = ref(false);

  async function handleCallback(): Promise<void> {
    try {
      // Parse tokens from URL
      const tokens = parseTokensFromUrl();

      if (!tokens) {
        throw new Error("No tokens found in callback URL");
      }

      // Set tokens in localStorage
      user.setSpotifyTokens(tokens.access_token, tokens.refresh_token);

      // Set profile with spotify_id if provided (ensures user.id is set for isAuthenticated check)
      if (tokens.spotify_id) {
        // Set ID directly to ensure isAuthenticated works before fetching full profile
        user.id = tokens.spotify_id;
      }

      // Fetch full profile and wait for it to complete
      await user.fetchSpotifyProfile();

      // Wait for Vue to process all reactivity updates
      await nextTick();

      // Mark as successful and show success message
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
    // Ensure state is fully propagated before navigation
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
