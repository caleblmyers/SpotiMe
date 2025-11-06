<template>
  <DataSection title="Top Artists" :is-loading="isLoading" :error="error" loading-message="Loading artists..."
    empty-message="No artists found" :show-empty="!artists || artists.length === 0" :on-retry="() => fetchTopArtists()">
    
    <!-- Top Artist (Rank 1) -->
    <div v-if="displayedTopArtist" class="mb-6 w-full max-w-full min-w-0">
      <div
        class="bg-gray-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow w-full min-w-0 flex items-stretch gap-4">
        <!-- Artist Image -->
        <div class="shrink-0 w-1/4 aspect-square bg-gray-200 overflow-hidden relative">
          <img v-if="displayedTopArtist.images && displayedTopArtist.images[0]" 
            :src="displayedTopArtist.images[0].url" 
            :alt="displayedTopArtist.name"
            class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No Image
          </div>
          <!-- Number Badge Overlay -->
          <div
            v-if="displayedTopArtist"
            class="absolute top-3 left-3 flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white font-bold text-lg shadow-lg">
            {{ getOriginalRank(displayedTopArtist.id) }}
          </div>
        </div>

        <!-- Artist Info -->
        <div class="flex-1 p-3 flex flex-col justify-center min-w-0">
          <h3 class="font-semibold text-base mb-1 truncate" :title="displayedTopArtist.name">
            {{ displayedTopArtist.name }}
          </h3>
          <div v-if="displayedTopArtist.genres && displayedTopArtist.genres.length > 0" class="flex flex-wrap gap-1">
            <span v-for="genre in displayedTopArtist.genres.slice(0, 2)" :key="genre"
              class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {{ genre }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Artists 2-5 in a Row -->
    <div v-if="rowArtists.length > 0" class="mb-6">
      <div class="grid grid-cols-4 gap-4 w-full">
        <div
          v-for="artist in rowArtists"
          :key="artist.id"
          @click="selectArtistFromRow(artist)"
          class="bg-gray-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer hover:scale-105 w-full min-w-0">
          <!-- Artist Image -->
          <div class="aspect-square bg-gray-200 overflow-hidden">
            <img v-if="artist.images && artist.images[0]" 
              :src="artist.images[0].url" 
              :alt="artist.name"
              class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          </div>

          <!-- Artist Info -->
          <div class="p-3">
            <div class="flex items-center gap-2 mb-1">
              <div class="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white font-bold text-xs">
                {{ getOriginalRank(artist.id) }}
              </div>
              <h3 class="font-semibold text-sm truncate flex-1" :title="artist.name">
                {{ artist.name }}
              </h3>
            </div>
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

    <!-- Remaining Artists Table (Paginated) -->
    <div v-if="remainingArtists.length > 0" class="mt-6">
      <div class="flex items-center justify-end mb-4">
        <Pagination :current-page="currentPage" :total-pages="totalPages" :disabled="isLoading" @next="goToNextPage"
          @previous="goToPreviousPage" />
      </div>
      
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rank</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Artist</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Genres</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Popularity</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template v-for="artist in paginatedRemainingArtists" :key="artist.id">
              <tr 
                @click="toggleExpandedArtist(artist.id)"
                class="hover:bg-gray-50 cursor-pointer transition-colors">
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ getArtistRank(artist.id) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="shrink-0 w-10 h-10 bg-gray-200 rounded overflow-hidden">
                      <img v-if="artist.images && artist.images[0]" 
                        :src="artist.images[0].url" 
                        :alt="artist.name"
                        class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    </div>
                    <div class="text-sm font-medium text-gray-900 truncate" :title="artist.name">
                      {{ artist.name }}
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="genre in artist.genres.slice(0, 2)" :key="genre"
                      class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {{ genre }}
                    </span>
                    <span v-if="artist.genres.length > 2" class="px-2 py-1 text-xs text-gray-500">
                      +{{ artist.genres.length - 2 }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ artist.popularity }}%
                </td>
              </tr>
              <!-- Expanded Row -->
              <tr v-if="expandedArtistId === artist.id" class="bg-gray-50">
                <td colspan="4" class="px-4 py-4">
                  <div class="flex items-start gap-4">
                    <!-- Large Artist Image -->
                    <div class="shrink-0 w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
                      <img v-if="artist.images && artist.images[0]" 
                        :src="artist.images[0].url" 
                        :alt="artist.name"
                        class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    </div>
                    
                    <!-- Artist Details -->
                    <div class="flex-1">
                      <h3 class="text-lg font-bold text-gray-900 mb-2">{{ artist.name }}</h3>
                      
                      <div class="space-y-2 mb-4">
                        <div>
                          <span class="text-sm font-semibold text-gray-700">Followers: </span>
                          <span class="text-sm text-gray-600">{{ formatNumber(artist.followers.total) }}</span>
                        </div>
                        <div>
                          <span class="text-sm font-semibold text-gray-700">Popularity: </span>
                          <span class="text-sm text-gray-600">{{ artist.popularity }}%</span>
                        </div>
                        <div>
                          <span class="text-sm font-semibold text-gray-700">Rank: </span>
                          <span class="text-sm text-gray-600">#{{ getArtistRank(artist.id) }}</span>
                        </div>
                      </div>
                      
                      <div v-if="artist.genres && artist.genres.length > 0">
                        <span class="text-sm font-semibold text-gray-700 block mb-2">Genres:</span>
                        <div class="flex flex-wrap gap-2">
                          <span v-for="genre in artist.genres" :key="genre"
                            class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                            {{ genre }}
                          </span>
                        </div>
                      </div>
                      
                      <div v-if="artist.external_urls?.spotify" class="mt-4">
                        <a 
                          :href="artist.external_urls.spotify" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          class="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
                          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                          </svg>
                          Open on Spotify
                        </a>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </DataSection>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useTopArtists } from '../composables/useTopArtists';
import { usePagination } from '../composables/usePagination';
import type { TimeRange } from '../types/spotify';
import type { SpotifyArtist } from '../types/spotify';
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

// State for managing top artist selection
const topArtistIndex = ref(0);
const expandedArtistId = ref<string | null>(null);

// Get all top 5 artists
const top5Artists = computed(() => {
  if (!artists.value) return [];
  return artists.value.slice(0, TOP_ARTISTS_COUNT);
});

// Get the currently displayed top artist
const displayedTopArtist = computed(() => {
  if (top5Artists.value.length === 0) return null;
  return top5Artists.value[topArtistIndex.value];
});

// Get artists 2-5 in a row (excluding the top artist, maintaining original rank order)
const rowArtists = computed(() => {
  if (top5Artists.value.length <= 1) return [];
  // Show all artists except the one currently at top, maintaining their original rank order
  const result: SpotifyArtist[] = [];
  for (let i = 0; i < top5Artists.value.length; i++) {
    if (i !== topArtistIndex.value) {
      const artist = top5Artists.value[i];
      if (artist) {
        result.push(artist);
      }
    }
  }
  return result;
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
  reset: resetPagination,
} = usePagination(remainingArtists, ITEMS_PER_PAGE);

// Get artist rank (1-based index in full list)
function getArtistRank(artistId: string): number {
  if (!artists.value) return 0;
  const index = artists.value.findIndex(a => a.id === artistId);
  return index >= 0 ? index + 1 : 0;
}

// Get original rank within top 5 (1-5)
function getOriginalRank(artistId: string): number {
  const index = top5Artists.value.findIndex(a => a.id === artistId);
  return index >= 0 ? index + 1 : 0;
}

// Format number with commas
function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Select artist from row (2-5) to swap with top artist
function selectArtistFromRow(artist: SpotifyArtist): void {
  if (!artists.value) return;
  const index = top5Artists.value.findIndex(a => a.id === artist.id);
  if (index >= 0) {
    topArtistIndex.value = index;
  }
}

// Toggle expanded artist in table
function toggleExpandedArtist(artistId: string): void {
  if (expandedArtistId.value === artistId) {
    expandedArtistId.value = null;
  } else {
    expandedArtistId.value = artistId;
  }
}

// Watch for time range changes and refetch
watch(
  () => props.timeRange,
  (newTimeRange) => {
    resetPagination();
    topArtistIndex.value = 0; // Reset to first artist
    expandedArtistId.value = null; // Close any expanded rows
    fetchTopArtists({ time_range: newTimeRange, limit: 50 });
  },
  { immediate: true }
);

// Reset top artist when artists data changes
watch(
  () => artists.value,
  () => {
    if (topArtistIndex.value >= (top5Artists.value.length || 0)) {
      topArtistIndex.value = 0;
    }
    expandedArtistId.value = null; // Close expanded rows when data changes
  }
);
</script>
