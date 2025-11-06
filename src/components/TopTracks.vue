<template>
  <DataSection title="Top Tracks" :is-loading="isLoading" :error="error" loading-message="Loading tracks..."
    empty-message="No tracks found" :show-empty="!tracks || tracks.length === 0" :on-retry="() => fetchTopTracks()">
    <!-- Top Track (Rank 1) -->
    <div v-if="displayedTopTrack" class="mb-6 w-full max-w-full min-w-0">
      <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden p-4">
        <ExpandedDetailView :title="displayedTopTrack.name" :image-url="displayedTopTrack.album?.images?.[0]?.url"
          image-placeholder="No Art" :fields="topTrackFields" :spotify-url="displayedTopTrack.external_urls?.spotify"
          :show-rank-badge="true" :rank-badge-value="getOriginalRank(displayedTopTrack.id)" />
      </div>
    </div>

    <!-- Tracks 2-5 in a Row -->
    <div v-if="rowTracks.length > 0" class="mb-6">
      <div class="grid grid-cols-4 gap-4 w-full">
        <div v-for="track in rowTracks" :key="track.id" @click="selectTrackFromRow(track)"
          class="bg-gray-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer hover:scale-105 w-full min-w-0">
          <!-- Album Art -->
          <div class="aspect-square bg-gray-200 overflow-hidden">
            <img v-if="track.album?.images && track.album.images[0]" :src="track.album.images[0].url"
              :alt="track.album.name" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Art
            </div>
          </div>

          <!-- Track Info -->
          <div class="p-3">
            <div class="flex items-center gap-2 mb-1">
              <RankBadge :rank="getOriginalRank(track.id)" size="small" />
              <h3 class="font-semibold text-sm truncate flex-1" :title="track.name">
                {{ track.name }}
              </h3>
            </div>
            <div class="text-xs text-gray-600 truncate" :title="track.album?.name">
              {{ track.album?.name || 'Unknown Album' }}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ formatDuration(track.duration_ms) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Remaining Tracks Table (Scrollable) -->
    <div v-if="remainingTracks.length > 0" class="mt-6">
      <ScrollableTable :columns="tableColumns">
        <template v-for="track in remainingTracks" :key="track.id">
          <tr @click="toggleExpandedTrack(track.id)" class="hover:bg-gray-50 cursor-pointer transition-colors">
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ getTrackRank(track.id) }}
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
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 truncate" :title="track.album?.name">
              {{ track.album?.name || 'Unknown Album' }}
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
import { computed, ref, watch } from 'vue';
import { useTopTracks } from '../composables/useTopTracks';
import { formatDuration } from '../utils/format';
import type { TimeRange } from '../types/spotify';
import type { SpotifyTrack } from '../types/spotify';
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

const TOP_TRACKS_COUNT = 5;
const timeRangeRef = computed(() => props.timeRange);
const { tracks, isLoading, error, fetchTopTracks } = useTopTracks({ limit: 50 }, timeRangeRef);

// State for managing top track selection
const topTrackIndex = ref(0);
const expandedTrackId = ref<string | null>(null);

// Get all top 5 tracks
const top5Tracks = computed(() => {
  if (!tracks.value) return [];
  return tracks.value.slice(0, TOP_TRACKS_COUNT);
});

// Get the currently displayed top track
const displayedTopTrack = computed(() => {
  if (top5Tracks.value.length === 0) return null;
  return top5Tracks.value[topTrackIndex.value];
});

// Get tracks 2-5 in a row (excluding the top track, maintaining original rank order)
const rowTracks = computed(() => {
  if (top5Tracks.value.length <= 1) return [];
  const result: SpotifyTrack[] = [];
  for (let i = 0; i < top5Tracks.value.length; i++) {
    if (i !== topTrackIndex.value) {
      const track = top5Tracks.value[i];
      if (track) {
        result.push(track);
      }
    }
  }
  return result;
});

// Get remaining tracks (after top 5)
const remainingTracks = computed(() => {
  if (!tracks.value) return [];
  return tracks.value.slice(TOP_TRACKS_COUNT);
});

// Table columns configuration
const tableColumns = [
  { key: 'rank', label: 'Rank' },
  { key: 'track', label: 'Track' },
  { key: 'album', label: 'Album' },
  { key: 'duration', label: 'Duration' },
];

// Get track rank (1-based index in full list)
function getTrackRank(trackId: string): number {
  if (!tracks.value) return 0;
  const index = tracks.value.findIndex(t => t.id === trackId);
  return index >= 0 ? index + 1 : 0;
}

// Get original rank within top 5 (1-5)
function getOriginalRank(trackId: string): number {
  const index = top5Tracks.value.findIndex(t => t.id === trackId);
  return index >= 0 ? index + 1 : 0;
}

// Get fields for expanded detail view
function getTrackFields(track: SpotifyTrack) {
  return [
    { label: 'Album', value: track.album?.name || 'Unknown Album' },
    { label: 'Artists', value: track.artists?.map(a => a.name).join(', ') || 'Unknown Artist' },
    { label: 'Duration', value: formatDuration(track.duration_ms) },
    { label: 'Popularity', value: `${track.popularity}%` },
    { label: 'Rank', value: `#${getTrackRank(track.id)}` },
  ];
}

// Fields for top track expanded view
const topTrackFields = computed(() => {
  if (!displayedTopTrack.value) return [];
  return getTrackFields(displayedTopTrack.value);
});

// Select track from row (2-5) to swap with top track
function selectTrackFromRow(track: SpotifyTrack): void {
  if (!tracks.value) return;
  const index = top5Tracks.value.findIndex(t => t.id === track.id);
  if (index >= 0) {
    topTrackIndex.value = index;
  }
}

// Toggle expanded track in table
function toggleExpandedTrack(trackId: string): void {
  if (expandedTrackId.value === trackId) {
    expandedTrackId.value = null;
  } else {
    expandedTrackId.value = trackId;
  }
}

// Reset top track when tracks data changes or time range changes
watch(
  () => [tracks.value, props.timeRange] as const,
  () => {
    topTrackIndex.value = 0;
    expandedTrackId.value = null;
    if (topTrackIndex.value >= (top5Tracks.value.length || 0)) {
      topTrackIndex.value = 0;
    }
  }
);
</script>
