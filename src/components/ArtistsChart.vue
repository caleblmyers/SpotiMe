<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-bold mb-4">Artists by Top Tracks</h2>
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <p class="text-gray-500">Loading chart data...</p>
    </div>
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>
    <div v-else-if="chartData && chartData.labels.length > 0" class="flex justify-center">
      <PolarArea :data="chartData" :options="chartOptions" class="max-w-full" />
    </div>
    <div v-else class="text-center py-12">
      <p class="text-gray-500">No artist data available</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch } from 'vue';
import { PolarArea } from 'vue-chartjs';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTopTracks } from '../composables/useTopTracks';
import type { TimeRange } from '../types/spotify';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

interface Props {
  timeRange?: TimeRange;
}

const props = withDefaults(defineProps<Props>(), {
  timeRange: 'medium_term',
});

const { tracks, isLoading, error, fetchTopTracks } = useTopTracks({ limit: 50 });

// Watch for time range changes and refetch
watch(
  () => props.timeRange,
  (newTimeRange) => {
    fetchTopTracks({ time_range: newTimeRange, limit: 50 });
  },
  { immediate: true }
);

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
        label: (context: { label: string; parsed: { r: number } }) => {
          return `${context.label}: ${context.parsed.r} track${context.parsed.r !== 1 ? 's' : ''}`;
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
    },
  },
};
</script>

