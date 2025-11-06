<template>
  <DataSection title="Top Artists" :is-loading="isLoading" :error="error" loading-message="Loading artists..."
    empty-message="No artists found" :show-empty="!artists || artists.length === 0" :on-retry="() => fetchTopArtists()">

    <!-- Top Artist (Rank 1) -->
    <div v-if="displayedTopArtist" class="mb-6 w-full max-w-full min-w-0">
      <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden p-4">
        <ExpandedDetailView :title="displayedTopArtist.name" :image-url="displayedTopArtist.images?.[0]?.url"
          image-placeholder="No Image" :fields="topArtistFields" :genres="displayedTopArtist.genres"
          :spotify-url="displayedTopArtist.external_urls?.spotify" :show-rank-badge="true"
          :rank-badge-value="getOriginalRank(displayedTopArtist.id)" />
      </div>
    </div>

    <!-- Artists 2-5 in a Row -->
    <div v-if="rowArtists.length > 0" class="mb-6">
      <div class="grid grid-cols-4 gap-4 w-full">
        <div v-for="artist in rowArtists" :key="artist.id" @click="selectArtistFromRow(artist)"
          class="bg-gray-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer hover:scale-105 w-full min-w-0">
          <!-- Artist Image -->
          <div class="aspect-square bg-gray-200 overflow-hidden">
            <img v-if="artist.images && artist.images[0]" :src="artist.images[0].url" :alt="artist.name"
              class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Image
            </div>
          </div>

          <!-- Artist Info -->
          <div class="p-3">
            <div class="flex items-center gap-2 mb-1">
              <RankBadge :rank="getOriginalRank(artist.id)" size="small" />
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

    <!-- Remaining Artists Table (Scrollable) -->
    <div v-if="remainingArtists.length > 0" class="mt-6">
      <ScrollableTable :columns="tableColumns">
        <template v-for="artist in remainingArtists" :key="artist.id">
          <tr @click="toggleExpandedArtist(artist.id)" class="hover:bg-gray-50 cursor-pointer transition-colors">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ getArtistRank(artist.id) }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div class="shrink-0 w-10 h-10 bg-gray-200 rounded overflow-hidden">
                  <img v-if="artist.images && artist.images[0]" :src="artist.images[0].url" :alt="artist.name"
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
              <ExpandedDetailView :title="artist.name" :image-url="artist.images?.[0]?.url" image-placeholder="No Image"
                :fields="getArtistFields(artist)" :genres="artist.genres"
                :spotify-url="artist.external_urls?.spotify" />
            </td>
          </tr>
        </template>
      </ScrollableTable>
    </div>
  </DataSection>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useTopArtists } from '../composables/useTopArtists';
import { formatNumber } from '../utils/format';
import type { TimeRange } from '../types/spotify';
import type { SpotifyArtist } from '../types/spotify';
import DataSection from './DataSection.vue';
import RankBadge from './RankBadge.vue';
import ExpandedDetailView from './ExpandedDetailView.vue';
import ScrollableTable from './ScrollableTable.vue';

interface Props {
  timeRange?: TimeRange;
}

const props = withDefaults(defineProps<Props>(), {
  timeRange: 'medium_term',
});

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

// Table columns configuration
const tableColumns = [
  { key: 'rank', label: 'Rank' },
  { key: 'artist', label: 'Artist' },
  { key: 'genres', label: 'Genres' },
  { key: 'popularity', label: 'Popularity' },
];

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

// Get fields for expanded detail view
function getArtistFields(artist: SpotifyArtist) {
  return [
    { label: 'Followers', value: formatNumber(artist.followers.total) },
    { label: 'Popularity', value: `${artist.popularity}%` },
    { label: 'Rank', value: `#${getArtistRank(artist.id)}` },
  ];
}

// Fields for top artist expanded view
const topArtistFields = computed(() => {
  if (!displayedTopArtist.value) return [];
  return getArtistFields(displayedTopArtist.value);
});

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
    topArtistIndex.value = 0;
    expandedArtistId.value = null;
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
    expandedArtistId.value = null;
  }
);
</script>
