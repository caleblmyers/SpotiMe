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
      <!-- User Info -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <UserProfile :profile="profile" :display-name="displayName" />
      </div>

      <!-- Charts Grid - 2 columns on large screens, responsive -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GenresChart />
        <ArtistsChart />
        <GenresRadarChart class="lg:col-span-2" />
        <RecentlyPlayedComparison class="lg:col-span-2" />
        <PlaylistComparison class="lg:col-span-2" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useUserStore } from "../store/user";
import { useProfile } from "../composables/useProfile";
import UserProfile from "../components/UserProfile.vue";
import GenresChart from "../components/GenresChart.vue";
import ArtistsChart from "../components/ArtistsChart.vue";
import GenresRadarChart from "../components/GenresRadarChart.vue";
import RecentlyPlayedComparison from "../components/RecentlyPlayedComparison.vue";
import PlaylistComparison from "../components/PlaylistComparison.vue";

const userStore = useUserStore();
const user = storeToRefs(userStore);
const { displayName, isAuthenticated } = user;

// Get full profile data with followers
const { profile } = useProfile();
</script>
