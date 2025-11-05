<template>
  <div class="w-full max-w-full min-w-0">
    <!-- Not Authenticated State -->
    <div v-if="!isAuthenticated" class="flex flex-col items-center justify-center min-h-[60vh]">
      <div class="text-center max-w-md px-4">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">Please log in to view graphs</h1>
        <p class="text-gray-600">Connect your Spotify account to see your listening statistics.</p>
      </div>
    </div>

    <!-- Authenticated State -->
    <div v-else class="space-y-4">
      <!-- User Info and Time Range Selector Row -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <!-- User Info -->
        <UserProfile :profile="profile" :display-name="displayName" />

        <!-- Time Range Selector -->
        <TimeRangeSelector v-model="timeRange" />
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GenresChart :time-range="timeRange" />
        <ArtistsChart :time-range="timeRange" />
      </div>

      <!-- Radar Chart Row -->
      <div class="grid grid-cols-1 gap-6">
        <GenresRadarChart />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from "../store/user";
import { useProfile } from "../composables/useProfile";
import type { TimeRange } from "../types/spotify";
import UserProfile from "../components/UserProfile.vue";
import GenresChart from "../components/GenresChart.vue";
import ArtistsChart from "../components/ArtistsChart.vue";
import GenresRadarChart from "../components/GenresRadarChart.vue";
import TimeRangeSelector from "../components/TimeRangeSelector.vue";

const userStore = useUserStore();
const user = storeToRefs(userStore);
const { displayName, isAuthenticated } = user;

// Get full profile data with followers
const { profile } = useProfile();

// Time range state
const timeRange = ref<TimeRange>('short_term');
</script>

