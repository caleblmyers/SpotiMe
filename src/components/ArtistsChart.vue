<template>
  <div class="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
    <div class="mb-3">
      <div class="flex items-center justify-between gap-4 mb-2">
        <h2 class="text-lg font-bold text-gray-900">Artists by Top Tracks</h2>
        <!-- Time Range Radio Group -->
        <div class="flex items-center gap-2 shrink-0">
          <label class="text-xs text-gray-600">Time:</label>
          <div class="flex gap-1 bg-gray-100 rounded p-0.5">
            <label
              v-for="range in timeRangeOptions"
              :key="range.value"
              class="cursor-pointer">
              <input
                type="radio"
                :value="range.value"
                v-model="timeRange"
                class="sr-only"
                @change="handleTimeRangeChange" />
              <span
                :class="[
                  'px-2 py-1 text-xs rounded transition whitespace-nowrap',
                  timeRange === range.value
                    ? 'bg-white text-gray-900 font-medium shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                ]">
                {{ range.label }}
              </span>
            </label>
          </div>
        </div>
      </div>
      <p v-if="summary" class="text-xs text-gray-500 mt-1">{{ summary }}</p>
    </div>
    <div v-if="isLoading" class="flex justify-center items-center py-8 flex-1">
      <p class="text-gray-500 text-sm">Loading...</p>
    </div>
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
      <p class="text-red-800 text-sm">{{ error }}</p>
    </div>
    <div v-else-if="chartData && chartData.labels.length > 0" class="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
      <!-- Chart on the left -->
      <div class="flex-1 flex items-center justify-center min-h-0 lg:min-w-0">
        <PolarArea :data="chartData" :options="chartOptions" class="max-w-full max-h-full" />
      </div>
      <!-- Detailed breakdown on the right -->
      <div class="lg:w-80 shrink-0 flex flex-col min-h-0">
        <h3 class="text-sm font-semibold text-gray-700 mb-3 shrink-0">Artist Breakdown</h3>
        <div class="overflow-y-auto space-y-2 max-h-[600px] min-h-0">
          <div
            v-for="artist in sortedArtistData"
            :key="artist.name"
            class="bg-gray-50 rounded transition-colors">
            <div
              @click="toggleArtist(artist.name)"
              class="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <div
                  class="w-3 h-3 rounded-full shrink-0"
                  :style="{ backgroundColor: artist.color }"></div>
                <span class="text-sm font-medium text-gray-900 truncate">{{ artist.name }}</span>
              </div>
              <div class="flex items-center gap-2 ml-2">
                <span class="text-sm text-gray-600">{{ artist.count }}</span>
                <span class="text-xs text-gray-500">({{ artist.percentage }}%)</span>
                <svg
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
                v-for="track in getTracksForArtist(artist.name)"
                :key="track.id"
                class="px-2 py-1 text-xs text-gray-700">
                <span class="truncate">{{ track.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 flex-1 flex items-center justify-center">
      <p class="text-gray-500 text-sm">No artist data available</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { PolarArea } from 'vue-chartjs';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTopTracks } from '../composables/useTopTracks';
import type { TimeRange, SpotifyTrack } from '../types/spotify';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

// Internal time range state
const timeRange = ref<TimeRange>('short_term');
const timeRangeRef = computed(() => timeRange.value);
const { tracks, isLoading, error } = useTopTracks({ limit: 50 }, timeRangeRef);

const timeRangeOptions = [
  { value: 'short_term' as TimeRange, label: '4W' },
  { value: 'medium_term' as TimeRange, label: '6M' },
  { value: 'long_term' as TimeRange, label: 'All' },
];

function handleTimeRangeChange() {
  // Reset expanded state when time range changes so first item auto-expands
  expandedArtist.value = null;
}

// Track which artist is expanded
const expandedArtist = ref<string | null>(null);

function toggleArtist(artistName: string): void {
  if (expandedArtist.value === artistName) {
    expandedArtist.value = null;
  } else {
    expandedArtist.value = artistName;
  }
}

function getTracksForArtist(artistName: string): SpotifyTrack[] {
  if (!tracks.value) return [];
  return tracks.value
    .filter(track => track.artists && track.artists.some(artist => artist.name === artistName))
    .sort((a, b) => b.popularity - a.popularity);
}

// Process artists from tracks
const chartData = computed(() => {
  if (!tracks.value || tracks.value.length === 0) {
    return null;
  }

  // Count artists across all tracks
  const artistCounts: Record<string, number> = {};
  
  tracks.value.forEach((track) => {
    if (track.artists && track.artists.length > 0) {
      track.artists.forEach((artist) => {
        artistCounts[artist.name] = (artistCounts[artist.name] || 0) + 1;
      });
    }
  });

  // Sort by count and take top 10
  const sortedArtists = Object.entries(artistCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (sortedArtists.length === 0) {
    return null;
  }

  // Generate colors for the chart
  const colors = generateColors(sortedArtists.length);

  return {
    labels: sortedArtists.map(([artist]) => artist),
    datasets: [
      {
        label: 'Track Count',
        data: sortedArtists.map(([, count]) => count),
        backgroundColor: colors.backgroundColors,
        borderColor: colors.borderColors,
        borderWidth: 1,
      },
    ],
  };
});

function generateColors(count: number): {
  backgroundColors: string[];
  borderColors: string[];
} {
  const colors = [
    'rgba(34, 197, 94, 0.6)', // green-500
    'rgba(59, 130, 246, 0.6)', // blue-500
    'rgba(168, 85, 247, 0.6)', // purple-500
    'rgba(236, 72, 153, 0.6)', // pink-500
    'rgba(249, 115, 22, 0.6)', // orange-500
    'rgba(239, 68, 68, 0.6)', // red-500
    'rgba(14, 165, 233, 0.6)', // sky-500
    'rgba(34, 197, 94, 0.4)', // green-400
    'rgba(59, 130, 246, 0.4)', // blue-400
    'rgba(168, 85, 247, 0.4)', // purple-400
  ];

  const borderColors = [
    'rgba(34, 197, 94, 1)',
    'rgba(59, 130, 246, 1)',
    'rgba(168, 85, 247, 1)',
    'rgba(236, 72, 153, 1)',
    'rgba(249, 115, 22, 1)',
    'rgba(239, 68, 68, 1)',
    'rgba(14, 165, 233, 1)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(168, 85, 247, 0.8)',
  ];

  return {
    backgroundColors: colors.slice(0, count),
    borderColors: borderColors.slice(0, count),
  };
}

const summary = computed(() => {
  if (!tracks.value || tracks.value.length === 0) return null;
  const totalArtists = chartData.value?.labels.length || 0;
  const totalTracks = tracks.value.length;
  return `${totalArtists} unique artists across ${totalTracks} tracks`;
});

// Sorted artist data for detailed breakdown
const sortedArtistData = computed(() => {
  if (!chartData.value || !tracks.value) return [];
  
  const dataset = chartData.value.datasets[0];
  if (!dataset) return [];
  
  return chartData.value.labels.map((artist, index) => {
    const count = dataset.data[index] ?? 0;
    const percentage = Math.round((count / tracks.value!.length) * 100);
    const color = (dataset.backgroundColor as string[])[index] ?? '';
    return {
      name: artist,
      count,
      percentage,
      color,
    };
  }).sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
});

// Auto-expand first artist when data becomes available
watch(sortedArtistData, (artists) => {
  if (artists.length > 0 && expandedArtist.value === null) {
    const firstArtist = artists[0];
    if (firstArtist) {
      expandedArtist.value = firstArtist.name;
    }
  }
}, { immediate: true });

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  aspectRatio: 1,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
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
        label: (context: { label: string; parsed: { r: number } }) => {
          const percentage = chartData.value 
            ? Math.round((context.parsed.r / tracks.value!.length) * 100)
            : 0;
          return `${context.label}: ${context.parsed.r} track${context.parsed.r !== 1 ? 's' : ''} (${percentage}%)`;
        },
      },
    },
  },
  scales: {
    r: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        font: {
          size: 9,
        },
      },
    },
  },
};
</script>

