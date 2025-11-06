<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-bold mb-4">Genre Evolution Over Time</h2>
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <p class="text-gray-500">Loading chart data...</p>
    </div>
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
      <button v-if="onRetry" @click="onRetry"
        class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
        Retry
      </button>
    </div>
    <div v-else-if="chartData && chartData.labels.length > 0" class="flex justify-center">
      <Radar :data="chartData" :options="chartOptions" class="max-w-full" />
    </div>
    <div v-else class="text-center py-12">
      <p class="text-gray-500">No genre data available</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue';
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

// Fetch data on mount
onMounted(() => {
  if (!shortTerm.artists.value) {
    shortTerm.fetchTopArtists({ time_range: 'short_term', limit: 50 });
  }
  if (!mediumTerm.artists.value) {
    mediumTerm.fetchTopArtists({ time_range: 'medium_term', limit: 50 });
  }
  if (!longTerm.artists.value) {
    longTerm.fetchTopArtists({ time_range: 'long_term', limit: 50 });
  }
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        padding: 15,
        usePointStyle: true,
        font: {
          size: 11,
        },
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
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
};
</script>
