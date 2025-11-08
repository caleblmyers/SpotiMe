<template>
  <div class="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
    <div class="mb-3">
      <h2 class="text-lg font-bold text-gray-900">Recently Played Tracks</h2>
      <p v-if="summary" class="text-xs text-gray-500 mt-1">{{ summary }}</p>
    </div>
    <div v-if="isLoading" class="flex justify-center items-center py-8 flex-1">
      <p class="text-gray-500 text-sm">Loading recently played tracks...</p>
    </div>
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
      <p class="text-red-800 text-sm">{{ error }}</p>
      <button @click="() => fetchRecentlyPlayed()"
        class="mt-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs">
        Retry
      </button>
    </div>
    <div v-else-if="tracks && tracks.length > 0" class="flex-1 overflow-y-auto min-h-0 max-h-[600px]">
      <div class="space-y-2 pr-2">
        <div
          v-for="(track, index) in tracks"
          :key="track.track.id"
          class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <!-- Track Number -->
          <div class="shrink-0 w-8 text-center text-sm font-medium text-gray-500">
            {{ index + 1 }}
          </div>
          
          <!-- Album Art -->
          <div class="shrink-0 w-14 h-14 bg-gray-200 rounded overflow-hidden">
            <img
              v-if="track.track.album?.images && track.track.album.images[0]"
              :src="track.track.album.images[0].url"
              :alt="track.track.album.name"
              class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Art
            </div>
          </div>
          
          <!-- Track Info -->
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-900 truncate" :title="track.track.name">
              {{ track.track.name }}
            </div>
            <div class="text-xs text-gray-600 truncate mt-0.5" :title="track.track.artists?.map(a => a.name).join(', ')">
              {{ track.track.artists?.map(a => a.name).join(', ') || 'Unknown Artist' }}
            </div>
            <div class="text-xs text-gray-500 truncate mt-0.5" :title="track.track.album?.name">
              {{ track.track.album?.name || 'Unknown Album' }}
            </div>
          </div>
          
          <!-- Duration, Played At, and Actions -->
          <div class="flex flex-col items-end gap-1 shrink-0">
            <span class="text-xs text-gray-500 whitespace-nowrap">
              {{ formatDuration(track.track.duration_ms) }}
            </span>
            <span class="text-xs text-gray-400 whitespace-nowrap" :title="track.played_at ? new Date(track.played_at).toLocaleString() : ''">
              {{ formatRelativeTime(track.played_at) }}
            </span>
          </div>
          <SpotifyLinkButton
            :url="track.track.external_urls.spotify"
            custom-class="px-2 py-1 text-xs shrink-0" />
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 flex-1 flex items-center justify-center">
      <p class="text-gray-500 text-sm">No recently played tracks found</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRecentlyPlayed } from '../composables/useRecentlyPlayed';
import { formatDuration, formatRelativeTime } from '../utils/format';
import SpotifyLinkButton from './SpotifyLinkButton.vue';

const { tracks, isLoading, error, fetchRecentlyPlayed } = useRecentlyPlayed({ limit: 50 });

// Summary
const summary = computed(() => {
  if (!tracks.value || tracks.value.length === 0) return null;
  return `${tracks.value.length} tracks`;
});
</script>

