<template>
  <DataSection
    title="Recently Played"
    :is-loading="isLoading"
    :error="error"
    loading-message="Loading recently played tracks..."
    empty-message="No recently played tracks found"
    :show-empty="!tracks || tracks.length === 0"
    :on-retry="() => fetchRecentlyPlayed()"
  >
    <!-- Recently Played Tracks Table (Scrollable) -->
    <div v-if="tracks && tracks.length > 0" class="mt-4">
      <ScrollableTable :columns="tableColumns">
        <template v-for="(track, index) in tracks" :key="track.id">
          <tr @click="toggleExpandedTrack(track.id)" class="hover:bg-gray-50 cursor-pointer transition-colors">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ index + 1 }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="shrink-0 w-10 h-10 bg-gray-200 rounded overflow-hidden">
                  <img v-if="track.album?.images && track.album.images[0]" :src="track.album.images[0].url"
                    :alt="track.album.name" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    No Art
                  </div>
                </div>
                <div class="text-sm font-medium text-gray-900 truncate max-w-xs" :title="track.name">
                  {{ track.name }}
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">
              <div class="truncate max-w-xs" :title="track.album?.name">
                {{ track.album?.name || 'Unknown Album' }}
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
              {{ formatDuration(track.duration_ms) }}
            </td>
          </tr>
          <!-- Expanded Row -->
          <tr v-if="expandedTrackId === track.id" class="bg-gray-50">
            <td colspan="4" class="px-4 py-4">
              <ExpandedDetailView :title="track.name" :image-url="track.album?.images?.[0]?.url"
                image-placeholder="No Art" :fields="getTrackFields(track)"
                :spotify-url="track.external_urls?.spotify" />
            </td>
          </tr>
        </template>
      </ScrollableTable>
    </div>
  </DataSection>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRecentlyPlayed } from '../composables/useRecentlyPlayed';
import { formatDuration } from '../utils/format';
import type { SpotifyTrack } from '../types/spotify';
import DataSection from './DataSection.vue';
import ExpandedDetailView from './ExpandedDetailView.vue';
import ScrollableTable from './ScrollableTable.vue';

const { tracks, isLoading, error, fetchRecentlyPlayed } = useRecentlyPlayed({ limit: 50 });

// State for managing expanded tracks
const expandedTrackId = ref<string | null>(null);

// Table columns configuration
const tableColumns = [
  { key: 'rank', label: '#' },
  { key: 'track', label: 'Track' },
  { key: 'album', label: 'Album' },
  { key: 'duration', label: 'Duration' },
];

// Get fields for expanded detail view
function getTrackFields(track: SpotifyTrack) {
  return [
    { label: 'Album', value: track.album?.name || 'Unknown Album' },
    { label: 'Artists', value: track.artists?.map(a => a.name).join(', ') || 'Unknown Artist' },
    { label: 'Duration', value: formatDuration(track.duration_ms) },
    { label: 'Popularity', value: `${track.popularity}%` },
  ];
}

// Toggle expanded track in table
function toggleExpandedTrack(trackId: string): void {
  if (expandedTrackId.value === trackId) {
    expandedTrackId.value = null;
  } else {
    expandedTrackId.value = trackId;
  }
}

// Reset expanded track when tracks data changes
watch(
  () => tracks.value,
  () => {
    expandedTrackId.value = null;
  }
);
</script>

