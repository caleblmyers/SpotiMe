<template>
  <DataSection
    title="Top Tracks"
    :is-loading="isLoading"
    :error="error"
    loading-message="Loading tracks..."
    empty-message="No tracks found"
    :show-empty="!tracks || tracks.length === 0"
    :on-retry="() => fetchTopTracks()"
  >
    <!-- Top 5 Tracks -->
    <div
      v-if="topTracks && topTracks.length > 0"
      class="space-y-3 mb-6 w-full max-w-full min-w-0"
    >
      <div
        v-for="(track, index) in topTracks"
        :key="track.id"
        class="bg-gray-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow w-full min-w-0 flex items-center gap-4 p-4"
      >
        <!-- Number Badge -->
        <div class="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-white font-bold text-lg">
          {{ index + 1 }}
        </div>

        <!-- Album Art -->
        <div class="shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
          <img
            v-if="track.album?.images && track.album.images[0]"
            :src="track.album.images[0].url"
            :alt="track.album.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No Art
          </div>
        </div>

        <!-- Track Info -->
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-base text-gray-900 truncate mb-1" :title="track.name">
            {{ track.name }}
          </div>
          <div class="text-sm text-gray-600 truncate" :title="track.album?.name">
            {{ track.album?.name || 'Unknown Album' }}
          </div>
        </div>

        <!-- Duration -->
        <div class="shrink-0 text-base text-gray-600 font-medium">
          {{ formatDuration(track.duration_ms) }}
        </div>
      </div>
    </div>

    <!-- Remaining Tracks List (Paginated) -->
    <div v-if="remainingTracks.length > 0" class="mt-6">
      <div class="flex items-center justify-end mb-4">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :disabled="isLoading"
          @next="goToNextPage"
          @previous="goToPreviousPage"
        />
      </div>
      <div
        v-if="paginatedRemainingTracks && paginatedRemainingTracks.length > 0"
        class="space-y-2 w-full max-w-full min-w-0"
      >
      <div
        v-for="track in paginatedRemainingTracks"
        :key="track.id"
        class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full min-w-0"
      >
        <!-- Album Art -->
        <div class="shrink-0">
          <div class="w-16 h-16 bg-gray-200 rounded overflow-hidden">
            <img
              v-if="track.album?.images && track.album.images[0]"
              :src="track.album.images[0].url"
              :alt="track.album.name"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-gray-400 text-xs"
            >
              No Art
            </div>
          </div>
        </div>

        <!-- Track Info -->
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-sm text-gray-900 truncate" :title="track.name">
            {{ track.name }}
          </div>
          <div class="text-xs text-gray-600 truncate" :title="track.album?.name">
            {{ track.album?.name || 'Unknown Album' }}
          </div>
        </div>

        <!-- Duration -->
        <div class="shrink-0 text-sm text-gray-600">
          {{ formatDuration(track.duration_ms) }}
        </div>
      </div>
    </div>
    </div>
  </DataSection>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useTopTracks } from '../composables/useTopTracks';
import { usePagination } from '../composables/usePagination';
import { formatDuration } from '../utils/format';
import DataSection from './DataSection.vue';
import Pagination from './Pagination.vue';

const ITEMS_PER_PAGE = 10;
const TOP_TRACKS_COUNT = 5;
const { tracks, isLoading, error, fetchTopTracks } = useTopTracks({ limit: 50 });

// Extract top 5 tracks
const topTracks = computed(() => {
  if (!tracks.value) return [];
  return tracks.value.slice(0, TOP_TRACKS_COUNT);
});

// Get remaining tracks (after top 5)
const remainingTracks = computed(() => {
  if (!tracks.value) return [];
  return tracks.value.slice(TOP_TRACKS_COUNT);
});

// Apply pagination to remaining tracks only
const {
  currentPage,
  totalPages,
  paginatedData: paginatedRemainingTracks,
  goToNextPage,
  goToPreviousPage,
} = usePagination(remainingTracks, ITEMS_PER_PAGE);
</script>
