<template>
  <DataSection title="Top Artists" :is-loading="isLoading" :error="error" loading-message="Loading artists..."
    empty-message="No artists found" :show-empty="!artists || artists.length === 0" :on-retry="() => fetchTopArtists()">
    <!-- Top 5 Artists -->
    <div v-if="topArtists && topArtists.length > 0" class="space-y-3 mb-6 w-full max-w-full min-w-0">
      <div v-for="(artist, index) in topArtists" :key="artist.id"
        class="bg-gray-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow w-full min-w-0 flex items-center gap-4 p-4">
        <!-- Number Badge -->
        <div
          class="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-white font-bold text-lg">
          {{ index + 1 }}
        </div>

        <!-- Artist Image -->
        <div class="shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
          <img v-if="artist.images && artist.images[0]" :src="artist.images[0].url" :alt="artist.name"
            class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
        </div>

        <!-- Artist Info -->
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-base mb-1 truncate" :title="artist.name">
            {{ artist.name }}
          </h3>
          <div v-if="artist.genres && artist.genres.length > 0" class="flex flex-wrap gap-1">
            <span v-for="genre in artist.genres.slice(0, 2)" :key="genre"
              class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {{ genre }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Remaining Artists Grid (Paginated) -->
    <div v-if="remainingArtists.length > 0" class="mt-6">
      <div class="flex items-center justify-end mb-4">
        <Pagination :current-page="currentPage" :total-pages="totalPages" :disabled="isLoading" @next="goToNextPage"
          @previous="goToPreviousPage" />
      </div>
      <div v-if="paginatedRemainingArtists && paginatedRemainingArtists.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-full min-w-0">
        <div v-for="artist in paginatedRemainingArtists" :key="artist.id"
          class="bg-gray-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow w-full min-w-0">
          <!-- Artist Image -->
          <div class="aspect-square bg-gray-200 overflow-hidden">
            <img v-if="artist.images && artist.images[0]" :src="artist.images[0].url" :alt="artist.name"
              class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          </div>

          <!-- Artist Info -->
          <div class="p-3">
            <h3 class="font-semibold text-sm mb-1 truncate" :title="artist.name">
              {{ artist.name }}
            </h3>
            <div v-if="artist.genres && artist.genres.length > 0" class="flex flex-wrap gap-1">
              <span v-for="genre in artist.genres.slice(0, 2)" :key="genre"
                class="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                {{ genre }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DataSection>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { useTopArtists } from '../composables/useTopArtists';
import { usePagination } from '../composables/usePagination';
import type { TimeRange } from '../types/spotify';
import DataSection from './DataSection.vue';
import Pagination from './Pagination.vue';

interface Props {
  timeRange?: TimeRange;
}

const props = withDefaults(defineProps<Props>(), {
  timeRange: 'medium_term',
});

const ITEMS_PER_PAGE = 10;
const TOP_ARTISTS_COUNT = 5;
const { artists, isLoading, error, fetchTopArtists } = useTopArtists({ limit: 50 });

// Watch for time range changes and refetch
watch(
  () => props.timeRange,
  (newTimeRange) => {
    fetchTopArtists({ time_range: newTimeRange, limit: 50 });
  },
  { immediate: true }
);

// Extract top 5 artists
const topArtists = computed(() => {
  if (!artists.value) return [];
  return artists.value.slice(0, TOP_ARTISTS_COUNT);
});

// Get remaining artists (after top 5)
const remainingArtists = computed(() => {
  if (!artists.value) return [];
  return artists.value.slice(TOP_ARTISTS_COUNT);
});

// Apply pagination to remaining artists only
const {
  currentPage,
  totalPages,
  paginatedData: paginatedRemainingArtists,
  goToNextPage,
  goToPreviousPage,
} = usePagination(remainingArtists, ITEMS_PER_PAGE);
</script>
