<template>
  <div class="w-full max-w-full min-w-0">
    <h2 class="text-2xl font-bold mb-4">Top Tracks</h2>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <p class="text-gray-500">Loading tracks...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
      <button
        @click="fetchTopTracks"
        class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Retry
      </button>
    </div>

    <!-- Tracks Table -->
    <div v-else-if="tracks.length > 0" class="overflow-x-auto w-full max-w-full">
      <table class="w-full border-collapse bg-white rounded-lg shadow-md overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Track</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Album</th>
            <th class="px-4 py-3 text-right text-sm font-semibold text-gray-700 border-b">Duration</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="track in tracks"
            :key="track.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-3 text-sm text-gray-900">
              <div class="font-medium">{{ track.name }}</div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">
              {{ track.album?.name || 'Unknown Album' }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-600 text-right">
              {{ formatDuration(track.duration_ms) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">No tracks found</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useTopTracks } from '../composables/useTopTracks';

const { tracks, loading, error, fetchTopTracks } = useTopTracks();

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
</script>

