<template>
  <div class="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
    <div class="mb-3">
      <h2 class="text-lg font-bold text-gray-900">Genre Evolution Over Time</h2>
      <p v-if="summary" class="text-xs text-gray-500 mt-1">{{ summary }}</p>
    </div>
    <div v-if="isLoading" class="flex justify-center items-center py-8 flex-1">
      <p class="text-gray-500 text-sm">Loading...</p>
    </div>
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3">
      <p class="text-red-800 text-sm">{{ error }}</p>
      <button @click="onRetry"
        class="mt-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition text-xs">
        Retry
      </button>
    </div>
    <div v-else-if="chartData && chartData.labels.length > 0" class="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
      <!-- Chart on the left -->
      <div class="flex-1 flex items-center justify-center min-h-0 lg:min-w-0">
        <Radar :data="chartData" :options="chartOptions" class="max-w-full max-h-full" />
      </div>
      <!-- Detailed breakdown on the right -->
      <div class="lg:w-80 shrink-0 flex flex-col min-h-0">
        <h3 class="text-sm font-semibold text-gray-700 mb-3 shrink-0">Genre Breakdown by Time Period</h3>
        <div class="overflow-y-auto space-y-4 max-h-[600px] min-h-0">
          <div
            v-for="(timeRange, datasetIndex) in chartData.datasets"
            :key="timeRange.label"
            class="space-y-2">
            <div class="flex items-center gap-2 mb-2">
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: timeRange.borderColor }"></div>
              <span class="text-sm font-semibold text-gray-900">{{ timeRange.label }}</span>
            </div>
            <div class="space-y-1 pl-5">
              <div
                v-for="genre in topGenresByTimeRange[datasetIndex]"
                :key="`${timeRange.label}-${genre.name}`"
                class="bg-gray-50 rounded transition-colors">
                <div
                  @click="toggleGenre(datasetIndex, genre.name)"
                  class="flex items-center justify-between text-xs p-1.5 hover:bg-gray-100 cursor-pointer rounded">
                  <span class="text-gray-700 truncate flex-1">{{ genre.name }}</span>
                  <div class="flex items-center gap-2 ml-2">
                    <span class="text-gray-600">{{ genre.count }}</span>
                    <svg
                      class="w-3 h-3 text-gray-500 transition-transform shrink-0"
                      :class="{ 'rotate-90': expandedGenre === `${datasetIndex}-${genre.name}` }"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                <div
                  v-if="expandedGenre === `${datasetIndex}-${genre.name}`"
                  class="px-2 pb-2 pt-1 space-y-1 border-t border-gray-200 mt-1">
                  <div
                    v-for="artist in getArtistsForGenre(datasetIndex, genre.name)"
                    :key="artist.id"
                    class="px-2 py-1 text-xs text-gray-700">
                    <span class="truncate">{{ artist.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 flex-1 flex items-center justify-center">
      <p class="text-gray-500 text-sm">No genre data available</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { Radar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js';
import { useTopArtists } from '../composables/useTopArtists';
import type { SpotifyArtist } from '../types/spotify';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const timeRangeLabels = {
  short_term: 'Last 4 Weeks',
  medium_term: 'Last 6 Months',
  long_term: 'All Time',
};

// Create separate composable instances for each time range
const shortTerm = useTopArtists({ limit: 50, time_range: 'short_term' });
const mediumTerm = useTopArtists({ limit: 50, time_range: 'medium_term' });
const longTerm = useTopArtists({ limit: 50, time_range: 'long_term' });

const isLoading = computed(() =>
  shortTerm.isLoading.value || mediumTerm.isLoading.value || longTerm.isLoading.value
);

const error = computed(() =>
  shortTerm.error.value || mediumTerm.error.value || longTerm.error.value || null
);

// Track which genre is expanded (format: "datasetIndex-genreName")
const expandedGenre = ref<string | null>(null);

function toggleGenre(datasetIndex: number, genreName: string): void {
  const key = `${datasetIndex}-${genreName}`;
  if (expandedGenre.value === key) {
    expandedGenre.value = null;
  } else {
    expandedGenre.value = key;
  }
}

function getArtistsForGenre(datasetIndex: number, genreName: string): SpotifyArtist[] {
  // Get artists from the specific time range based on datasetIndex
  let artists: SpotifyArtist[] | null = null;
  
  if (datasetIndex === 0) {
    artists = shortTerm.artists.value;
  } else if (datasetIndex === 1) {
    artists = mediumTerm.artists.value;
  } else if (datasetIndex === 2) {
    artists = longTerm.artists.value;
  }
  
  if (!artists || artists.length === 0) {
    return [];
  }
  
  // Filter by genre and sort by popularity
  return artists
    .filter(artist => artist.genres && artist.genres.includes(genreName))
    .sort((a, b) => b.popularity - a.popularity);
}

function processGenres(artists: SpotifyArtist[] | null): Record<string, number> {
  if (!artists || artists.length === 0) {
    return {};
  }

  const genreCounts: Record<string, number> = {};

  artists.forEach((artist) => {
    if (artist.genres && artist.genres.length > 0) {
      artist.genres.forEach((genre) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    }
  });

  return genreCounts;
}

const chartData = computed(() => {
  const shortTermGenres = processGenres(shortTerm.artists.value);
  const mediumTermGenres = processGenres(mediumTerm.artists.value);
  const longTermGenres = processGenres(longTerm.artists.value);

  // Get all unique genres across all time ranges
  const allGenres = new Set([
    ...Object.keys(shortTermGenres),
    ...Object.keys(mediumTermGenres),
    ...Object.keys(longTermGenres),
  ]);

  if (allGenres.size === 0) {
    return null;
  }

  // Calculate total count for each genre across all time ranges
  const genreTotals: Record<string, number> = {};
  allGenres.forEach((genre) => {
    genreTotals[genre] =
      (shortTermGenres[genre] || 0) +
      (mediumTermGenres[genre] || 0) +
      (longTermGenres[genre] || 0);
  });

  // Sort by total and take top 12 genres
  const topGenres = Object.entries(genreTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12)
    .map(([genre]) => genre);

  if (topGenres.length === 0) {
    return null;
  }

  // Create datasets for each time range
  const datasets = [
    {
      label: timeRangeLabels.short_term,
      data: topGenres.map((genre) => shortTermGenres[genre] || 0),
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(34, 197, 94, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(34, 197, 94, 1)',
    },
    {
      label: timeRangeLabels.medium_term,
      data: topGenres.map((genre) => mediumTermGenres[genre] || 0),
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
    },
    {
      label: timeRangeLabels.long_term,
      data: topGenres.map((genre) => longTermGenres[genre] || 0),
      backgroundColor: 'rgba(168, 85, 247, 0.2)',
      borderColor: 'rgba(168, 85, 247, 1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(168, 85, 247, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(168, 85, 247, 1)',
    },
  ];

  return {
    labels: topGenres,
    datasets,
  };
});

function onRetry(): void {
  shortTerm.fetchTopArtists({ time_range: 'short_term', limit: 50 });
  mediumTerm.fetchTopArtists({ time_range: 'medium_term', limit: 50 });
  longTerm.fetchTopArtists({ time_range: 'long_term', limit: 50 });
}

// Data will be fetched automatically by composables with time_range in defaultParams

const summary = computed(() => {
  if (!chartData.value) return null;
  const genreCount = chartData.value.labels.length;
  return `Top ${genreCount} genres across all time periods`;
});

// Top genres by time range for detailed breakdown
const topGenresByTimeRange = computed(() => {
  if (!chartData.value) return [[], [], []];
  
  const datasets = chartData.value.datasets;
  const labels = chartData.value.labels;
  
  return datasets.map((dataset) => {
    return labels
      .map((genre, genreIndex) => ({
        name: genre,
        count: dataset.data[genreIndex] ?? 0,
      }))
      .filter(item => (item.count ?? 0) > 0)
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
      .slice(0, 5); // Top 5 per time range
  });
});

// Auto-expand first genre of first time range when data becomes available
watch(topGenresByTimeRange, (genresByRange) => {
  if (genresByRange.length > 0 && genresByRange[0].length > 0 && expandedGenre.value === null) {
    const firstGenre = genresByRange[0][0];
    expandedGenre.value = `0-${firstGenre.name}`;
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
        label: (context: TooltipItem<'radar'>) => {
          const label = context.dataset.label || '';
          const value = context.formattedValue || '0';
          return `${label}: ${value} artist${value !== '1' ? 's' : ''}`;
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
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
};
</script>
