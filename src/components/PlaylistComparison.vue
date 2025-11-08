<template>
  <div class="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
    <div class="mb-3">
      <h2 class="text-lg font-bold text-gray-900">Top Tracks/Artists vs Playlists</h2>
      <p v-if="summary" class="text-xs text-gray-500 mt-1">{{ summary }}</p>
    </div>
    <div v-if="isLoading" class="flex justify-center items-center py-8 flex-1">
      <p class="text-gray-500 text-sm">Loading...</p>
    </div>
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
      <p class="text-red-800 text-sm">{{ error }}</p>
    </div>
    <div v-else-if="tracksChartData && artistsChartData" class="flex-1 flex flex-col gap-4 min-h-0">
      <!-- Tracks Chart -->
      <div class="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        <div class="flex-1 flex items-center justify-center min-h-0 lg:min-w-0">
          <Bar :data="tracksChartData" :options="tracksChartOptions" class="max-w-full max-h-full" />
        </div>
        <div class="lg:w-80 shrink-0 flex flex-col min-h-0">
          <h3 class="text-sm font-semibold text-gray-700 mb-3 shrink-0">Playlist Breakdown</h3>
          <div class="overflow-y-auto space-y-2 max-h-[300px] min-h-0">
            <div
              v-for="playlist in playlistsWithMatches"
              :key="playlist.id"
              class="bg-gray-50 rounded p-2">
              <div class="flex items-center justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">{{ playlist.name }}</div>
                  <div class="text-xs text-gray-600 mt-1">
                    {{ playlist.tracks.total }} total tracks
                  </div>
                </div>
                <SpotifyLinkButton
                  :url="playlist.external_urls.spotify"
                  size="small"
                  custom-class="shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Artists Chart -->
      <div class="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        <div class="flex-1 flex items-center justify-center min-h-0 lg:min-w-0">
          <Bar :data="artistsChartData" :options="artistsChartOptions" class="max-w-full max-h-full" />
        </div>
        <div class="lg:w-80 shrink-0 flex flex-col min-h-0">
          <h3 class="text-sm font-semibold text-gray-700 mb-3 shrink-0">Playlist Breakdown</h3>
          <div class="overflow-y-auto space-y-2 max-h-[300px] min-h-0">
            <div
              v-for="playlist in playlistsWithMatches"
              :key="playlist.id"
              class="bg-gray-50 rounded p-2">
              <div class="flex items-center justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">{{ playlist.name }}</div>
                  <div class="text-xs text-gray-600 mt-1">
                    {{ playlist.tracks.total }} total tracks
                  </div>
                </div>
                <SpotifyLinkButton
                  :url="playlist.external_urls.spotify"
                  size="small"
                  custom-class="shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 flex-1 flex items-center justify-center">
      <p class="text-gray-500 text-sm">No comparison data available</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js';
import { useTopTracks } from '../composables/useTopTracks';
import { useTopArtists } from '../composables/useTopArtists';
import { usePlaylists } from '../composables/usePlaylists';
import { makeAuthenticatedRequest } from '../composables/useApi';
import SpotifyLinkButton from './SpotifyLinkButton.vue';
import type { SpotifyTrack, SpotifyArtist, SpotifyPlaylistTrack, PaginatedResponse } from '../types/spotify';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Note: We're showing all time ranges on the chart, so no time range selector needed
// But keeping the structure in case we want to add filtering later

// Fetch top tracks and artists for all time ranges
const shortTermTracks = useTopTracks({ limit: 50, time_range: 'short_term' });
const mediumTermTracks = useTopTracks({ limit: 50, time_range: 'medium_term' });
const longTermTracks = useTopTracks({ limit: 50, time_range: 'long_term' });

const shortTermArtists = useTopArtists({ limit: 50, time_range: 'short_term' });
const mediumTermArtists = useTopArtists({ limit: 50, time_range: 'medium_term' });
const longTermArtists = useTopArtists({ limit: 50, time_range: 'long_term' });

const isLoadingTracks = computed(() => shortTermTracks.isLoading.value || mediumTermTracks.isLoading.value || longTermTracks.isLoading.value);
const isLoadingArtists = computed(() => shortTermArtists.isLoading.value || mediumTermArtists.isLoading.value || longTermArtists.isLoading.value);
const errorTracks = computed(() => shortTermTracks.error.value || mediumTermTracks.error.value || longTermTracks.error.value || null);
const errorArtists = computed(() => shortTermArtists.error.value || mediumTermArtists.error.value || longTermArtists.error.value || null);

// Fetch playlists
const { playlists: playlistsData, isLoading: isLoadingPlaylists, error: errorPlaylists, fetchPlaylists } = usePlaylists();

const isLoading = computed(() => isLoadingTracks.value || isLoadingArtists.value || isLoadingPlaylists.value || isLoadingPlaylistTracks.value);
const error = computed(() => errorTracks.value || errorArtists.value || errorPlaylists.value || errorPlaylistTracks.value || null);

// Fetch playlists on mount
fetchPlaylists({ limit: 50 });

// Track playlist tracks loading state
const isLoadingPlaylistTracks = ref(false);
const errorPlaylistTracks = ref<string | null>(null);
const allPlaylistTracks = ref<Map<string, Set<string>>>(new Map()); // playlistId -> Set of track IDs
const allPlaylistArtists = ref<Map<string, Set<string>>>(new Map()); // playlistId -> Set of artist IDs

// Fetch tracks for all playlists using direct API calls
watch(playlistsData, async (playlists) => {
  if (!playlists?.items) return;
  
  isLoadingPlaylistTracks.value = true;
  errorPlaylistTracks.value = null;
  allPlaylistTracks.value.clear();
  allPlaylistArtists.value.clear();

  try {
    // Fetch tracks for each playlist (limit to first 20 playlists for performance)
    const playlistsToProcess = playlists.items.slice(0, 20);
    
    await Promise.all(
      playlistsToProcess.map(async (playlist) => {
        try {
          const response = await makeAuthenticatedRequest<PaginatedResponse<SpotifyPlaylistTrack>>(
            `/api/playlists/${playlist.id}/tracks`,
            { limit: 100 }
          );
          
          if (response.items) {
            const trackIds = new Set<string>();
            const artistIds = new Set<string>();
            
            response.items.forEach((item) => {
              if (item.track?.id) {
                trackIds.add(item.track.id);
                // Extract artist IDs
                if (item.track.artists) {
                  item.track.artists.forEach(artist => {
                    if (artist.id) {
                      artistIds.add(artist.id);
                    }
                  });
                }
              }
            });
            
            allPlaylistTracks.value.set(playlist.id, trackIds);
            allPlaylistArtists.value.set(playlist.id, artistIds);
          }
        } catch (err) {
          console.error(`Error fetching tracks for playlist ${playlist.id}:`, err);
        }
      })
    );
  } catch (err) {
    errorPlaylistTracks.value = 'Failed to fetch some playlist tracks';
    console.error('Error fetching playlist tracks:', err);
  } finally {
    isLoadingPlaylistTracks.value = false;
  }
}, { immediate: true });


// Get all unique top tracks/artists across all time ranges for breakdown
const allTopTracks = computed(() => {
  const trackMap = new Map<string, SpotifyTrack>();
  [shortTermTracks.tracks.value, mediumTermTracks.tracks.value, longTermTracks.tracks.value].forEach(tracks => {
    tracks?.forEach(track => {
      if (!trackMap.has(track.id)) {
        trackMap.set(track.id, track);
      }
    });
  });
  return Array.from(trackMap.values());
});

const allTopArtists = computed(() => {
  const artistMap = new Map<string, SpotifyArtist>();
  [shortTermArtists.artists.value, mediumTermArtists.artists.value, longTermArtists.artists.value].forEach(artists => {
    artists?.forEach(artist => {
      if (!artistMap.has(artist.id)) {
        artistMap.set(artist.id, artist);
      }
    });
  });
  return Array.from(artistMap.values());
});

// Get playlists that have matches (used for breakdown display)
const playlistsWithMatches = computed(() => {
  if (!playlistsData.value?.items) return [];
  
  const playlists = playlistsData.value.items.slice(0, 20);
  
  // Get track and artist IDs for all time ranges
  const shortTermTrackIds = new Set(shortTermTracks.tracks.value?.map(t => t.id) || []);
  const mediumTermTrackIds = new Set(mediumTermTracks.tracks.value?.map(t => t.id) || []);
  const longTermTrackIds = new Set(longTermTracks.tracks.value?.map(t => t.id) || []);
  const shortTermArtistIds = new Set(shortTermArtists.artists.value?.map(a => a.id) || []);
  const mediumTermArtistIds = new Set(mediumTermArtists.artists.value?.map(a => a.id) || []);
  const longTermArtistIds = new Set(longTermArtists.artists.value?.map(a => a.id) || []);
  
  return playlists.filter(playlist => {
    const playlistTrackIds = allPlaylistTracks.value.get(playlist.id) || new Set<string>();
    const playlistArtistIds = allPlaylistArtists.value.get(playlist.id) || new Set<string>();
    
    // Check if playlist has any matching tracks
    const hasTracks = Array.from(playlistTrackIds).some(id => 
      shortTermTrackIds.has(id) || mediumTermTrackIds.has(id) || longTermTrackIds.has(id)
    );
    
    // Check if playlist has any matching artists
    const hasArtists = Array.from(playlistArtistIds).some(id => 
      shortTermArtistIds.has(id) || mediumTermArtistIds.has(id) || longTermArtistIds.has(id)
    );
    
    return hasTracks || hasArtists;
  });
});


// Tracks chart data - showing playlists on x-axis
const tracksChartData = computed(() => {
  if (!playlistsData.value?.items || playlistsData.value.items.length === 0) return null;
  if (!shortTermTracks.tracks.value && !mediumTermTracks.tracks.value && !longTermTracks.tracks.value) return null;

  const playlists = playlistsData.value.items.slice(0, 20); // Limit to first 20 for performance

  // Get track IDs for each time range
  const shortTermTrackIds = new Set(shortTermTracks.tracks.value?.map(t => t.id) || []);
  const mediumTermTrackIds = new Set(mediumTermTracks.tracks.value?.map(t => t.id) || []);
  const longTermTrackIds = new Set(longTermTracks.tracks.value?.map(t => t.id) || []);

  // Count tracks in each playlist for each time range and filter playlists with matches
  const playlistData: Array<{ playlist: typeof playlists[0]; shortCount: number; mediumCount: number; longCount: number }> = [];

  playlists.forEach(playlist => {
    const playlistTrackIds = allPlaylistTracks.value.get(playlist.id) || new Set<string>();
    
    const shortCount = Array.from(playlistTrackIds).filter(id => shortTermTrackIds.has(id)).length;
    const mediumCount = Array.from(playlistTrackIds).filter(id => mediumTermTrackIds.has(id)).length;
    const longCount = Array.from(playlistTrackIds).filter(id => longTermTrackIds.has(id)).length;
    
    // Only include playlists that have at least one match
    if (shortCount > 0 || mediumCount > 0 || longCount > 0) {
      playlistData.push({
        playlist,
        shortCount,
        mediumCount,
        longCount,
      });
    }
  });

  if (playlistData.length === 0) return null;

  return {
    labels: playlistData.map(d => d.playlist.name),
    datasets: [
      {
        label: 'Last 4 Weeks',
        data: playlistData.map(d => d.shortCount),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Last 6 Months',
        data: playlistData.map(d => d.mediumCount),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'All Time',
        data: playlistData.map(d => d.longCount),
        backgroundColor: 'rgba(168, 85, 247, 0.6)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 1,
      },
    ],
  };
});

// Artists chart data - showing playlists on x-axis
const artistsChartData = computed(() => {
  if (!playlistsData.value?.items || playlistsData.value.items.length === 0) return null;
  if (!shortTermArtists.artists.value && !mediumTermArtists.artists.value && !longTermArtists.artists.value) return null;

  const playlists = playlistsData.value.items.slice(0, 20); // Limit to first 20 for performance

  // Get artist IDs for each time range
  const shortTermArtistIds = new Set(shortTermArtists.artists.value?.map(a => a.id) || []);
  const mediumTermArtistIds = new Set(mediumTermArtists.artists.value?.map(a => a.id) || []);
  const longTermArtistIds = new Set(longTermArtists.artists.value?.map(a => a.id) || []);

  // Count artists in each playlist for each time range and filter playlists with matches
  const playlistData: Array<{ playlist: typeof playlists[0]; shortCount: number; mediumCount: number; longCount: number }> = [];

  playlists.forEach(playlist => {
    const playlistArtistIds = allPlaylistArtists.value.get(playlist.id) || new Set<string>();
    
    const shortCount = Array.from(playlistArtistIds).filter(id => shortTermArtistIds.has(id)).length;
    const mediumCount = Array.from(playlistArtistIds).filter(id => mediumTermArtistIds.has(id)).length;
    const longCount = Array.from(playlistArtistIds).filter(id => longTermArtistIds.has(id)).length;
    
    // Only include playlists that have at least one match
    if (shortCount > 0 || mediumCount > 0 || longCount > 0) {
      playlistData.push({
        playlist,
        shortCount,
        mediumCount,
        longCount,
      });
    }
  });

  if (playlistData.length === 0) return null;

  return {
    labels: playlistData.map(d => d.playlist.name),
    datasets: [
      {
        label: 'Last 4 Weeks',
        data: playlistData.map(d => d.shortCount),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Last 6 Months',
        data: playlistData.map(d => d.mediumCount),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'All Time',
        data: playlistData.map(d => d.longCount),
        backgroundColor: 'rgba(168, 85, 247, 0.6)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 1,
      },
    ],
  };
});

// Summary
const summary = computed(() => {
  const tracksCount = allTopTracks.value.length;
  const artistsCount = allTopArtists.value.length;
  const playlistsCount = playlistsData.value?.items?.length || 0;
  return `Comparing ${tracksCount} top tracks and ${artistsCount} top artists across ${playlistsCount} playlists`;
});

// Chart options
const tracksChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: 1,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        padding: 8,
        usePointStyle: true,
        font: { size: 9 },
        boxWidth: 8,
      },
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<'bar'>) => {
          const label = context.dataset.label || '';
          const value = context.formattedValue || '0';
          return `${label}: ${value}`;
        },
      },
    },
  },
  scales: {
    x: {
      stacked: false,
      ticks: {
        font: { size: 9 },
        maxRotation: 45,
        minRotation: 45,
      },
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        font: { size: 9 },
      },
      title: {
        display: true,
        text: 'Number of Top Tracks',
        font: { size: 11 },
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
}));

const artistsChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: 1,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        padding: 8,
        usePointStyle: true,
        font: { size: 9 },
        boxWidth: 8,
      },
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<'bar'>) => {
          const label = context.dataset.label || '';
          const value = context.formattedValue || '0';
          return `${label}: ${value}`;
        },
      },
    },
  },
  scales: {
    x: {
      stacked: false,
      ticks: {
        font: { size: 9 },
        maxRotation: 45,
        minRotation: 45,
      },
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        font: { size: 9 },
      },
      title: {
        display: true,
        text: 'Number of Top Artists',
        font: { size: 11 },
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
}));
</script>

