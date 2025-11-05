<template>
  <div class="flex flex-col items-center justify-center min-h-[400px]">
    <div class="text-center space-y-4">
      <div v-if="loading" class="space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p class="text-gray-600">Completing authentication...</p>
      </div>
      <div v-else-if="error" class="space-y-4">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p class="text-red-800 font-semibold mb-2">Authentication Failed</p>
          <p class="text-red-600 text-sm">{{ error }}</p>
        </div>
        <button @click="redirectToHome"
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">
          Return to Home
        </button>
      </div>
      <div v-else-if="success" class="space-y-4">
        <div class="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md">
          <p class="text-green-800 font-semibold mb-2">Authentication Successful!</p>
          <p class="text-green-600 text-sm">You have been successfully authenticated with Spotify.</p>
        </div>
        <button @click="redirectToHome"
          class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">
          Go to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAuthCallback } from '../composables/useAuthCallback';

const { loading, error, success, redirectToHome } = useAuthCallback();
</script>
