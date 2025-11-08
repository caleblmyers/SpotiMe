<template>
  <div class="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
    <div class="mb-3">
      <div class="flex items-center justify-between gap-4 mb-2">
        <h2 class="text-lg font-bold text-gray-900">Genres by Top Artists</h2>
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
        <h3 class="text-sm font-semibold text-gray-700 mb-3 shrink-0">Genre Breakdown</h3>
        <div class="overflow-y-auto space-y-2 max-h-[600px] min-h-0">
          <div
            v-for="genre in sortedGenreData"
            :key="genre.name"
            class="bg-gray-50 rounded transition-colors">
            <div
              @click="toggleGenre(genre.name)"
              class="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <div
                  class="w-3 h-3 rounded-full shrink-0"
                  :style="{ backgroundColor: genre.color }"></div>
                <span class="text-sm font-medium text-gray-900 truncate">{{ genre.name }}</span>
              </div>
              <div class="flex items-center gap-2 ml-2">
                <span class="text-sm text-gray-600">{{ genre.count }}</span>
                <span class="text-xs text-gray-500">({{ genre.percentage }}%)</span>
                <svg
                  class="w-4 h-4 text-gray-500 transition-transform shrink-0"
                  :class="{ 'rotate-90': expandedGenre === genre.name }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <div
              v-if="expandedGenre === genre.name"
              class="px-2 pb-2 pt-1 space-y-1 border-t border-gray-200 mt-1">
              <div
                v-for="artist in getArtistsForGenre(genre.name)"
                :key="artist.id"
                class="px-2 py-1 text-xs text-gray-700">
                <span class="truncate">{{ artist.name }}</span>
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
import { PolarArea } from 'vue-chartjs';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTopArtists } from '../composables/useTopArtists';
import type { TimeRange, SpotifyArtist } from '../types/spotify';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

// Internal time range state
const timeRange = ref<TimeRange>('short_term');
const timeRangeRef = computed(() => timeRange.value);
const { artists, isLoading, error } = useTopArtists({ limit: 50 }, timeRangeRef);

const timeRangeOptions = [
  { value: 'short_term' as TimeRange, label: '4W' },
  { value: 'medium_term' as TimeRange, label: '6M' },
  { value: 'long_term' as TimeRange, label: 'All' },
];

function handleTimeRangeChange() {
  // Reset expanded state when time range changes so first item auto-expands
  expandedGenre.value = null;
}

// Track which genre is expanded
const expandedGenre = ref<string | null>(null);

function toggleGenre(genreName: string): void {
  if (expandedGenre.value === genreName) {
    expandedGenre.value = null;
  } else {
    expandedGenre.value = genreName;
  }
}

function getArtistsForGenre(genreName: string): SpotifyArtist[] {
  if (!artists.value) return [];
  return artists.value
    .filter(artist => artist.genres && artist.genres.includes(genreName))
    .sort((a, b) => b.popularity - a.popularity);
}

// Process genres from artists
const chartData = computed(() => {
  if (!artists.value || artists.value.length === 0) {
    return null;
  }

  // Count genres across all artists
  const genreCounts: Record<string, number> = {};
  
  artists.value.forEach((artist) => {
    if (artist.genres && artist.genres.length > 0) {
      artist.genres.forEach((genre) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    }
  });

  // Sort by count and take top 10
  const sortedGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  if (sortedGenres.length === 0) {
    return null;
  }

  // Generate colors for the chart
  const colors = generateColors(sortedGenres.length);

  return {
    labels: sortedGenres.map(([genre]) => genre),
    datasets: [
      {
        label: 'Genre Count',
        data: sortedGenres.map(([, count]) => count),
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
  if (!artists.value || artists.value.length === 0) return null;
  const totalGenres = chartData.value?.labels.length || 0;
  const totalArtists = artists.value.length;
  return `${totalGenres} unique genres across ${totalArtists} artists`;
});

// Sorted genre data for detailed breakdown
const sortedGenreData = computed(() => {
  if (!chartData.value || !artists.value) return [];
  
  const dataset = chartData.value.datasets[0];
  if (!dataset) return [];
  
  return chartData.value.labels.map((genre, index) => {
    const count = dataset.data[index] ?? 0;
    const percentage = Math.round((count / artists.value!.length) * 100);
    const color = (dataset.backgroundColor as string[])[index] ?? '';
    return {
      name: genre,
      count,
      percentage,
      color,
    };
  }).sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
});

// Auto-expand first genre when data becomes available
watch(sortedGenreData, (genres) => {
  if (genres.length > 0 && expandedGenre.value === null) {
    const firstGenre = genres[0];
    if (firstGenre) {
      expandedGenre.value = firstGenre.name;
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
            ? Math.round((context.parsed.r / artists.value!.length) * 100)
            : 0;
          return `${context.label}: ${context.parsed.r} artist${context.parsed.r !== 1 ? 's' : ''} (${percentage}%)`;
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

