<template>
  <div class="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
    <div class="mb-3">
      <h2 class="text-lg font-bold text-gray-900">Recently Played vs Top Tracks</h2>
      <p v-if="summary" class="text-xs text-gray-500 mt-1">{{ summary }}</p>
    </div>
    <div v-if="isLoading" class="flex justify-center items-center py-8 flex-1">
      <p class="text-gray-500 text-sm">Loading...</p>
    </div>
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
      <p class="text-red-800 text-sm">{{ error }}</p>
    </div>
    <div v-else-if="chartData && chartData.datasets && chartData.datasets.length > 0" class="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
      <!-- Chart on the left -->
      <div class="flex-1 flex items-center justify-center min-h-0 lg:min-w-0">
        <Bar :data="chartData" :options="chartOptions" class="max-w-full max-h-full" />
      </div>
      <!-- Detailed breakdown on the right -->
      <div class="lg:w-80 shrink-0 flex flex-col min-h-0">
        <h3 class="text-sm font-semibold text-gray-700 mb-3 shrink-0">Artist Comparison</h3>
        <div class="overflow-y-auto space-y-2 max-h-[600px] min-h-0">
          <div
            v-for="artist in sortedComparisonData"
            :key="artist.name"
            class="bg-gray-50 rounded transition-colors">
            <div
              @click="toggleArtist(artist.name)"
              class="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="text-sm font-medium text-gray-900 truncate">{{ artist.name }}</span>
              </div>
              <div class="flex items-center gap-1 ml-2 shrink-0 flex-wrap">
                <span class="text-xs px-2 py-0.5 rounded" :class="artist.recentlyPlayedCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'">
                  RP: {{ artist.recentlyPlayedCount }}
                </span>
                <span class="text-xs px-2 py-0.5 rounded" :class="artist.shortTermCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'">
                  S: {{ artist.shortTermCount }}
                </span>
                <span class="text-xs px-2 py-0.5 rounded" :class="artist.mediumTermCount > 0 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-600'">
                  M: {{ artist.mediumTermCount }}
                </span>
                <span class="text-xs px-2 py-0.5 rounded" :class="artist.longTermCount > 0 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'">
                  L: {{ artist.longTermCount }}
                </span>
                <svg
                  v-if="artist.recentlyPlayedCount > 0 || artist.shortTermCount > 0 || artist.mediumTermCount > 0 || artist.longTermCount > 0"
                  class="w-4 h-4 text-gray-500 transition-transform shrink-0"
                  :class="{ 'rotate-90': expandedArtist === artist.name }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div
              v-if="expandedArtist === artist.name"
              class="px-2 pb-2 pt-1 space-y-1 border-t border-gray-200 mt-1">
              <div
                v-for="track in getArtistTracks(artist.name)"
                :key="track.id"
                class="flex items-center justify-between gap-2 px-2 py-1.5 text-xs hover:bg-gray-100 rounded">
                <span class="truncate flex-1 text-gray-700">{{ track.name }}</span>
                <div class="flex items-center gap-1 shrink-0">
                  <span
                    v-if="track.inRecentlyPlayed"
                    class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800"
                    title="Recently Played">
                    RP
                  </span>
                  <span
                    v-if="track.inShortTerm"
                    class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800"
                    title="Last 4 Weeks">
                    S
                  </span>
                  <span
                    v-if="track.inMediumTerm"
                    class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-800"
                    title="Last 6 Months">
                    M
                  </span>
                  <span
                    v-if="track.inLongTerm"
                    class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800"
                    title="All Time">
                    L
                  </span>
                </div>
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
import { useRecentlyPlayed } from '../composables/useRecentlyPlayed';
import { useTopTracks } from '../composables/useTopTracks';
import type { SpotifyTrack } from '../types/spotify';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Fetch recently played and top tracks for all time ranges
const { tracks: recentlyPlayedTracks, isLoading: isLoadingRecent, error: errorRecent } = useRecentlyPlayed({ limit: 50 });
const shortTerm = useTopTracks({ limit: 50, time_range: 'short_term' });
const mediumTerm = useTopTracks({ limit: 50, time_range: 'medium_term' });
const longTerm = useTopTracks({ limit: 50, time_range: 'long_term' });

const isLoading = computed(() => 
  isLoadingRecent.value || 
  shortTerm.isLoading.value || 
  mediumTerm.isLoading.value || 
  longTerm.isLoading.value
);
const error = computed(() => 
  errorRecent.value || 
  shortTerm.error.value || 
  mediumTerm.error.value || 
  longTerm.error.value || 
  null
);

// Track which artist is expanded
const expandedArtist = ref<string | null>(null);

function toggleArtist(artistName: string): void {
  if (expandedArtist.value === artistName) {
    expandedArtist.value = null;
  } else {
    expandedArtist.value = artistName;
  }
}

// Get all unique tracks for an artist with criteria flags
function getArtistTracks(artistName: string): Array<SpotifyTrack & {
  inRecentlyPlayed: boolean;
  inShortTerm: boolean;
  inMediumTerm: boolean;
  inLongTerm: boolean;
}> {
  const artistData = sortedComparisonData.value.find(a => a.name === artistName);
  if (!artistData) return [];

  // Get all unique tracks by ID
  const allTracks = new Map<string, SpotifyTrack>();
  
  [...artistData.recentlyPlayedTracks, ...artistData.shortTermTracks, ...artistData.mediumTermTracks, ...artistData.longTermTracks].forEach(track => {
    if (!allTracks.has(track.id)) {
      allTracks.set(track.id, track);
    }
  });

  // Create sets of track IDs for quick lookup
  const recentlyPlayedIds = new Set(artistData.recentlyPlayedTracks.map(t => t.id));
  const shortTermIds = new Set(artistData.shortTermTracks.map(t => t.id));
  const mediumTermIds = new Set(artistData.mediumTermTracks.map(t => t.id));
  const longTermIds = new Set(artistData.longTermTracks.map(t => t.id));

  // Return tracks with criteria flags, sorted alphabetically by name
  return Array.from(allTracks.values())
    .map(track => ({
      ...track,
      inRecentlyPlayed: recentlyPlayedIds.has(track.id),
      inShortTerm: shortTermIds.has(track.id),
      inMediumTerm: mediumTermIds.has(track.id),
      inLongTerm: longTermIds.has(track.id),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Process artists from tracks (handles both old format and new format with played_at)
function processArtists(tracks: any[] | null): Record<string, SpotifyTrack[]> {
  if (!tracks || tracks.length === 0) {
    return {};
  }

  const artistTracks: Record<string, SpotifyTrack[]> = {};

  tracks.forEach((item) => {
    // Handle both formats: new format with {track, played_at} or old format with direct track
    const track: SpotifyTrack = item.track || item;
    
    if (track.artists && track.artists.length > 0) {
      track.artists.forEach((artist) => {
        if (!artistTracks[artist.name]) {
          artistTracks[artist.name] = [];
        }
        // Avoid duplicates
        const artistTrackList = artistTracks[artist.name];
        if (artistTrackList && !artistTrackList.some(t => t.id === track.id)) {
          artistTrackList.push(track);
        }
      });
    }
  });

  return artistTracks;
}

// Chart data
const chartData = computed(() => {
  const recentlyPlayedArtists = processArtists(recentlyPlayedTracks.value);
  const shortTermArtists = processArtists(shortTerm.tracks.value);
  const mediumTermArtists = processArtists(mediumTerm.tracks.value);
  const longTermArtists = processArtists(longTerm.tracks.value);

  // Get all unique artists across all time ranges
  const allArtists = new Set([
    ...Object.keys(recentlyPlayedArtists),
    ...Object.keys(shortTermArtists),
    ...Object.keys(mediumTermArtists),
    ...Object.keys(longTermArtists),
  ]);

  if (allArtists.size === 0) {
    return null;
  }

  // Calculate counts for each artist across all time ranges
  const artistData = Array.from(allArtists).map(artist => ({
    name: artist,
    recentlyPlayedCount: recentlyPlayedArtists[artist]?.length || 0,
    shortTermCount: shortTermArtists[artist]?.length || 0,
    mediumTermCount: mediumTermArtists[artist]?.length || 0,
    longTermCount: longTermArtists[artist]?.length || 0,
    maxTopTracksCount: Math.max(
      shortTermArtists[artist]?.length || 0,
      mediumTermArtists[artist]?.length || 0,
      longTermArtists[artist]?.length || 0
    ),
    totalCount: (recentlyPlayedArtists[artist]?.length || 0) + 
                (shortTermArtists[artist]?.length || 0) + 
                (mediumTermArtists[artist]?.length || 0) + 
                (longTermArtists[artist]?.length || 0),
  }));

  // Sort by total count and take top 20
  const topArtists = artistData
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, 20);

  if (topArtists.length === 0) {
    return null;
  }

  // Create mapping of artist labels
  const artistLabels = topArtists.map(a => a.name);

  return {
    labels: artistLabels,
    datasets: [
      {
        label: 'Recently Played',
        data: topArtists.map(artist => artist.recentlyPlayedCount),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: timeRangeLabels.short_term,
        data: topArtists.map(artist => artist.shortTermCount),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: timeRangeLabels.medium_term,
        data: topArtists.map(artist => artist.mediumTermCount),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
      {
        label: timeRangeLabels.long_term,
        data: topArtists.map(artist => artist.longTermCount),
        backgroundColor: 'rgba(168, 85, 247, 0.6)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 1,
      },
    ],
  };
});

const timeRangeLabels = {
  short_term: 'Last 4 Weeks',
  medium_term: 'Last 6 Months',
  long_term: 'All Time',
};

// Summary
const summary = computed(() => {
  if (!recentlyPlayedTracks.value) return null;
  const recentCount = recentlyPlayedTracks.value.length;
  return `Comparing ${recentCount} recently played tracks with all time ranges`;
});

// Sorted comparison data for detailed breakdown
const sortedComparisonData = computed(() => {
  if (!recentlyPlayedTracks.value) return [];

  const recentlyPlayedArtists = processArtists(recentlyPlayedTracks.value);
  const shortTermArtists = processArtists(shortTerm.tracks.value);
  const mediumTermArtists = processArtists(mediumTerm.tracks.value);
  const longTermArtists = processArtists(longTerm.tracks.value);

  // Get all unique artists
  const allArtists = new Set([
    ...Object.keys(recentlyPlayedArtists),
    ...Object.keys(shortTermArtists),
    ...Object.keys(mediumTermArtists),
    ...Object.keys(longTermArtists),
  ]);

  return Array.from(allArtists)
    .map(artist => ({
      name: artist,
      recentlyPlayedCount: recentlyPlayedArtists[artist]?.length || 0,
      shortTermCount: shortTermArtists[artist]?.length || 0,
      mediumTermCount: mediumTermArtists[artist]?.length || 0,
      longTermCount: longTermArtists[artist]?.length || 0,
      recentlyPlayedTracks: recentlyPlayedArtists[artist] || [],
      shortTermTracks: shortTermArtists[artist] || [],
      mediumTermTracks: mediumTermArtists[artist] || [],
      longTermTracks: longTermArtists[artist] || [],
      totalCount: (recentlyPlayedArtists[artist]?.length || 0) + 
                  (shortTermArtists[artist]?.length || 0) + 
                  (mediumTermArtists[artist]?.length || 0) + 
                  (longTermArtists[artist]?.length || 0),
    }))
    .filter(artist => artist.totalCount > 0)
    .sort((a, b) => b.totalCount - a.totalCount);
});

// Auto-expand first artist when data becomes available
watch(sortedComparisonData, (artists) => {
  if (artists.length > 0 && expandedArtist.value === null) {
    const firstArtist = artists[0];
    if (firstArtist) {
      expandedArtist.value = firstArtist.name;
    }
  }
}, { immediate: true });

const chartOptions = computed(() => ({
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
        font: {
          size: 9,
        },
        boxWidth: 8,
      },
    },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<'bar'>) => {
          const label = context.dataset.label || '';
          const value = context.formattedValue || '0';
          return `${label}: ${value} track${value !== '1' ? 's' : ''}`;
        },
      },
    },
  },
  scales: {
    x: {
      stacked: false,
      ticks: {
        font: {
          size: 9,
        },
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
        font: {
          size: 9,
        },
      },
      title: {
        display: true,
        text: 'Number of Tracks',
        font: {
          size: 11,
        },
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
}));
</script>

