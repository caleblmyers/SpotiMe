<template>
  <div class="bg-white rounded-lg shadow-md p-4">
    <h2 class="text-lg font-bold text-gray-900 mb-4">Playlists Example</h2>
    
    <!-- Example 1: List Playlists -->
    <div class="mb-6">
      <h3 class="text-sm font-semibold text-gray-700 mb-2">Your Playlists</h3>
      <div v-if="playlistsLoading" class="text-sm text-gray-500">Loading playlists...</div>
      <div v-else-if="playlistsError" class="text-sm text-red-600">{{ playlistsError }}</div>
      <div v-else-if="playlistsData" class="space-y-2">
        <div
          v-for="playlist in playlistsData.items"
          :key="playlist.id"
          class="p-2 bg-gray-50 rounded hover:bg-gray-100">
          <div class="font-medium">{{ playlist.name }}</div>
          <div class="text-xs text-gray-500">{{ playlist.tracks.total }} tracks</div>
        </div>
      </div>
    </div>

    <!-- Example 2: Search by Track -->
    <div class="mb-6">
      <h3 class="text-sm font-semibold text-gray-700 mb-2">Search Playlists by Track</h3>
      <input
        v-model="trackSearchId"
        type="text"
        placeholder="Enter track ID"
        class="px-3 py-1 border rounded text-sm mb-2" />
      <button
        @click="searchByTrack"
        class="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
        Search
      </button>
      <div v-if="searchLoading" class="text-sm text-gray-500 mt-2">Searching...</div>
      <div v-else-if="searchError" class="text-sm text-red-600 mt-2">{{ searchError }}</div>
      <div v-else-if="trackSearchResults" class="mt-2 space-y-2">
        <div
          v-for="playlist in trackSearchResults"
          :key="'playlist' in playlist ? playlist.playlist.id : playlist.id"
          class="p-2 bg-gray-50 rounded">
          {{ 'playlist' in playlist ? playlist.playlist.name : playlist.name }}
        </div>
      </div>
    </div>

    <!-- Example 3: Analyze Top -->
    <div>
      <h3 class="text-sm font-semibold text-gray-700 mb-2">Analyze Top Tracks/Artists</h3>
      <button
        @click="analyzeTop"
        class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
        Analyze
      </button>
      <div v-if="searchLoading && isAnalyzeMode" class="text-sm text-gray-500 mt-2">Analyzing...</div>
      <div v-else-if="searchError && isAnalyzeMode" class="text-sm text-red-600 mt-2">{{ searchError }}</div>
      <div v-else-if="analyzeResults && analyzeResults.length > 0" class="mt-2 space-y-2">
        <div
          v-for="result in analyzeResults"
          :key="result.playlist.id"
          class="p-2 bg-gray-50 rounded">
          <div class="font-medium">{{ result.playlist.name }}</div>
          <div class="text-xs text-gray-600">
            Top Tracks: {{ result.top_tracks_count }} ({{ result.top_tracks_percentage.toFixed(1) }}%)
          </div>
          <div class="text-xs text-gray-600">
            Top Artists: {{ result.top_artists_count }} ({{ result.top_artists_percentage.toFixed(1) }}%)
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { usePlaylists } from '../composables/usePlaylists';
import { usePlaylistSearch } from '../composables/usePlaylistSearch';
import type { PlaylistSearchResult } from '../types/spotify';

// Example 1: Fetch playlists
const { playlists: playlistsData, isLoading: playlistsLoading, error: playlistsError } = usePlaylists({ limit: 20 });

// Example 2 & 3: Playlist search
const { results: searchResults, isLoading: searchLoading, error: searchError, searchByTrack: searchByTrackFn, analyzeTop: analyzeTopFn } = usePlaylistSearch();

const trackSearchId = ref('');
const isAnalyzeMode = ref(false);

async function searchByTrack() {
  if (trackSearchId.value) {
    isAnalyzeMode.value = false;
    await searchByTrackFn(trackSearchId.value);
  }
}

async function analyzeTop() {
  isAnalyzeMode.value = true;
  await analyzeTopFn('medium_term');
}

// Separate analyze results from search results
const analyzeResults = computed<PlaylistSearchResult[] | null>(() => {
  if (!searchResults.value || !isAnalyzeMode.value) return null;
  // Check if results have the analyze structure
  if (searchResults.value.length > 0) {
    const firstResult = searchResults.value[0];
    if (firstResult && 'top_tracks_count' in firstResult) {
      return searchResults.value as PlaylistSearchResult[];
    }
  }
  return null;
});

const trackSearchResults = computed(() => {
  if (!searchResults.value || isAnalyzeMode.value) return null;
  return searchResults.value;
});
</script>

