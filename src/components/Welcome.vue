<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh]">
    <div class="text-center max-w-md px-4">
      <div class="mb-6">
        <div class="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.299.18-.599.48-.719 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.302 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.78-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
        </div>
      </div>
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Welcome to SpotiMe</h1>
      <p class="text-gray-600 text-lg mb-8">
        Connect your Spotify account to discover your top artists, tracks, and music insights.
      </p>
      <button @click="connectWithSpotify"
        class="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-lg font-semibold shadow-lg hover:shadow-xl">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path
            d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.299.18-.599.48-.719 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.302 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.78-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
        </svg>
        Connect with Spotify
      </button>
      <div class="mt-8 text-sm text-gray-500">
        <p>View your listening statistics and explore your music taste</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { loginSpotify } from '../api/spotify';

async function connectWithSpotify(): Promise<void> {
  await loginSpotify();
}
</script>
