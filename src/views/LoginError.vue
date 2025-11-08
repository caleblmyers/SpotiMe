<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh]">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <!-- Error Icon -->
      <div class="mb-6">
        <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      </div>

      <!-- Error Title -->
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>

      <!-- Error Message -->
      <div class="space-y-4 mb-6">
        <p v-if="isWhitelistError" class="text-gray-700">
          Your Spotify account is not currently whitelisted for this application.
        </p>
        <p v-else class="text-gray-700">
          An error occurred during authentication.
        </p>
        <p v-if="isWhitelistError" class="text-sm text-gray-600">
          This application is currently in a limited access phase. Only whitelisted users can authenticate and use the service.
        </p>
        <p v-else class="text-sm text-gray-600">
          Please try again or contact support if the problem persists.
        </p>
      </div>

      <!-- Additional Information -->
      <div v-if="isWhitelistError" class="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-4">
        <div>
          <h2 class="text-sm font-semibold text-gray-900 mb-2">What does this mean?</h2>
          <ul class="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>Your Spotify account needs to be added to the application's whitelist</li>
            <li>This is a security measure to control access during development/testing</li>
            <li>Contact the application administrator to request access</li>
          </ul>
        </div>
        <div class="pt-3 border-t border-gray-200">
          <h2 class="text-sm font-semibold text-gray-900 mb-2">Alternative: Run Locally</h2>
          <p class="text-xs text-gray-600 mb-2">
            You can create a local instance of this application and set up your own Spotify app to use it:
          </p>
          <ul class="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>Clone the repository and set up the project locally</li>
            <li>Create a Spotify app in the <a href="https://developer.spotify.com/dashboard" target="_blank" class="text-green-600 hover:text-green-700 underline">Spotify Developer Dashboard</a></li>
            <li>Configure your local environment with your Spotify app credentials</li>
            <li>Run the application locally to use it with your own Spotify account</li>
          </ul>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <button
          @click="goHome"
          class="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">
          Return to Home
        </button>
        <button
          @click="tryAgain"
          class="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium">
          Try Again
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { loginSpotify } from '../api/spotify';

interface Props {
  error?: string | string[];
}

const props = withDefaults(defineProps<Props>(), {
  error: 'unknown',
});

const router = useRouter();

const errorType = computed(() => {
  const error = Array.isArray(props.error) ? props.error[0] : props.error;
  return error || 'unknown';
});

const isWhitelistError = computed(() => {
  return errorType.value === 'unknown' || errorType.value === 'whitelist';
});

function goHome(): void {
  router.push('/');
}

async function tryAgain(): Promise<void> {
  try {
    await loginSpotify();
  } catch (error) {
    console.error('Failed to initiate Spotify login:', error);
  }
}
</script>

