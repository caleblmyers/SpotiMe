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
    <!-- Top Track (Rank 1) -->
    <div v-if="displayedTopTrack" class="mb-6 w-full max-w-full min-w-0">
      <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden p-4">
        <div class="flex items-start gap-4">
          <!-- Large Album Art -->
          <div class="shrink-0 w-1/4 h-1/4 bg-gray-200 rounded-lg overflow-hidden">
            <img
              v-if="displayedTopTrack.album?.images && displayedTopTrack.album.images[0]"
              :src="displayedTopTrack.album.images[0].url"
              :alt="displayedTopTrack.album.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              No Art
            </div>
          </div>

          <!-- Track Details -->
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <div
                v-if="displayedTopTrack"
                class="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white font-bold text-lg shadow-lg">
                {{ getOriginalRank(displayedTopTrack.id) }}
              </div>
              <h3 class="text-lg font-bold text-gray-900">{{ displayedTopTrack.name }}</h3>
            </div>

            <div class="space-y-2 mb-4">
              <div>
                <span class="text-sm font-semibold text-gray-700">Album: </span>
                <span class="text-sm text-gray-600">{{ displayedTopTrack.album?.name || 'Unknown Album' }}</span>
              </div>
              <div>
                <span class="text-sm font-semibold text-gray-700">Artists: </span>
                <span class="text-sm text-gray-600">{{ displayedTopTrack.artists?.map(a => a.name).join(', ') || 'Unknown Artist' }}</span>
              </div>
              <div>
                <span class="text-sm font-semibold text-gray-700">Duration: </span>
                <span class="text-sm text-gray-600">{{ formatDuration(displayedTopTrack.duration_ms) }}</span>
              </div>
              <div>
                <span class="text-sm font-semibold text-gray-700">Popularity: </span>
                <span class="text-sm text-gray-600">{{ displayedTopTrack.popularity }}%</span>
              </div>
              <div>
                <span class="text-sm font-semibold text-gray-700">Rank: </span>
                <span class="text-sm text-gray-600">#{{ getTrackRank(displayedTopTrack.id) }}</span>
              </div>
            </div>

            <div v-if="displayedTopTrack.external_urls?.spotify" class="mt-4">
              <a
                :href="displayedTopTrack.external_urls.spotify"
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
      </div>
    </div>

    <!-- Tracks 2-5 in a Row -->
    <div v-if="rowTracks.length > 0" class="mb-6">
      <div class="grid grid-cols-4 gap-4 w-full">
        <div
          v-for="track in rowTracks"
          :key="track.id"
          @click="selectTrackFromRow(track)"
          class="bg-gray-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer hover:scale-105 w-full min-w-0">
          <!-- Album Art -->
          <div class="aspect-square bg-gray-200 overflow-hidden">
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
          <div class="p-3">
            <div class="flex items-center gap-2 mb-1">
              <div class="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white font-bold text-xs">
                {{ getOriginalRank(track.id) }}
              </div>
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
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto max-h-[800px] overflow-y-auto">
          <table class="w-full">
            <thead class="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rank</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Track</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Album</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Duration</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <template v-for="track in remainingTracks" :key="track.id">
                <tr
                  @click="toggleExpandedTrack(track.id)"
                  class="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ getTrackRank(track.id) }}
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="shrink-0 w-10 h-10 bg-gray-200 rounded overflow-hidden">
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
                    <div class="flex items-start gap-4">
                      <!-- Large Album Art -->
                      <div class="shrink-0 w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          v-if="track.album?.images && track.album.images[0]"
                          :src="track.album.images[0].url"
                          :alt="track.album.name"
                          class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                          No Art
                        </div>
                      </div>

                      <!-- Track Details -->
                      <div class="flex-1">
                        <h3 class="text-lg font-bold text-gray-900 mb-2">{{ track.name }}</h3>

                        <div class="space-y-2 mb-4">
                          <div>
                            <span class="text-sm font-semibold text-gray-700">Album: </span>
                            <span class="text-sm text-gray-600">{{ track.album?.name || 'Unknown Album' }}</span>
                          </div>
                          <div>
                            <span class="text-sm font-semibold text-gray-700">Artists: </span>
                            <span class="text-sm text-gray-600">{{ track.artists?.map(a => a.name).join(', ') || 'Unknown Artist' }}</span>
                          </div>
                          <div>
                            <span class="text-sm font-semibold text-gray-700">Duration: </span>
                            <span class="text-sm text-gray-600">{{ formatDuration(track.duration_ms) }}</span>
                          </div>
                          <div>
                            <span class="text-sm font-semibold text-gray-700">Popularity: </span>
                            <span class="text-sm text-gray-600">{{ track.popularity }}%</span>
                          </div>
                          <div>
                            <span class="text-sm font-semibold text-gray-700">Rank: </span>
                            <span class="text-sm text-gray-600">#{{ getTrackRank(track.id) }}</span>
                          </div>
                        </div>

                        <div v-if="track.external_urls?.spotify" class="mt-4">
                          <a
                            :href="track.external_urls.spotify"
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

interface Props {
  timeRange?: TimeRange;
}

const props = withDefaults(defineProps<Props>(), {
  timeRange: 'medium_term',
});

const TOP_TRACKS_COUNT = 5;
const { tracks, isLoading, error, fetchTopTracks } = useTopTracks({ limit: 50 });

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
  // Show all tracks except the one currently at top, maintaining their original rank order
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

// Watch for time range changes and refetch
watch(
  () => props.timeRange,
  (newTimeRange) => {
    topTrackIndex.value = 0; // Reset to first track
    expandedTrackId.value = null; // Close any expanded rows
    fetchTopTracks({ time_range: newTimeRange, limit: 50 });
  },
  { immediate: true }
);

// Reset top track when tracks data changes
watch(
  () => tracks.value,
  () => {
    if (topTrackIndex.value >= (top5Tracks.value.length || 0)) {
      topTrackIndex.value = 0;
    }
    expandedTrackId.value = null; // Close expanded rows when data changes
  }
);
</script>
