<template>
  <div class="w-full max-w-full min-w-0 bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold">Top Tracks</h2>
      <div v-if="totalPages > 1" class="flex items-center gap-2">
        <button @click="goToPreviousPage" :disabled="currentPage === 1 || isLoading"
          class="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition">
          Previous
        </button>
        <span class="text-sm text-gray-600">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button @click="goToNextPage" :disabled="currentPage === totalPages || isLoading"
          class="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition">
          Next
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <p class="text-gray-500">Loading tracks...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
      <button @click="() => fetchTopTracks()"
        class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
        Retry
      </button>
    </div>

    <!-- Tracks Table -->
    <div v-else-if="paginatedTracks && paginatedTracks.length > 0" class="overflow-x-auto w-full max-w-full">
      <table class="w-full border-collapse overflow-hidden">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">Track</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">Album</th>
            <th class="px-3 py-2 text-right text-xs font-semibold text-gray-700 border-b">Duration</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="track in paginatedTracks" :key="track.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-3 py-2 text-sm text-gray-900">
              <div class="font-medium">{{ track.name }}</div>
            </td>
            <td class="px-3 py-2 text-sm text-gray-600">
              {{ track.album?.name || 'Unknown Album' }}
            </td>
            <td class="px-3 py-2 text-sm text-gray-600 text-right">
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
import { computed, ref } from 'vue';
import { useTopTracks } from '../composables/useTopTracks';

const ITEMS_PER_PAGE = 10;
const { tracks, isLoading, error, fetchTopTracks } = useTopTracks({ limit: 50 });

const currentPage = ref(1);

const totalPages = computed(() => {
  if (!tracks.value) return 0;
  return Math.ceil(tracks.value.length / ITEMS_PER_PAGE);
});

const paginatedTracks = computed(() => {
  if (!tracks.value) return [];
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  return tracks.value.slice(start, end);
});

function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function goToPreviousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
</script>
