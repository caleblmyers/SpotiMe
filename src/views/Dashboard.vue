<template>
  <div class="w-full max-w-full min-w-0">
    <!-- Loading State (during auth restoration) -->
    <div v-if="isRestoringAuth" class="flex flex-col items-center justify-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>

    <!-- Not Authenticated State -->
    <Welcome v-else-if="!isAuthenticated" />

    <!-- Authenticated State -->
    <div v-else class="space-y-4 h-full flex flex-col">
      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">
        <!-- Left Column (40%) - Top Tracks -->
        <div class="lg:col-span-2 space-y-4">
      <!-- User Info and Time Range Selector Row -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <!-- User Info -->
        <UserProfile :profile="profile" :display-name="displayName" />

        <!-- Time Range Selector -->
            <div class="ml-auto">
        <TimeRangeSelector v-model="timeRange" />
            </div>
      </div>

          <TopTracks :time-range="timeRange" />
        </div>

        <!-- Right Column (60%) - Top Artists -->
        <div class="lg:col-span-3 flex flex-col min-h-0">
          <TopArtists :time-range="timeRange" />
        </div>
      </div>

      <!-- Recently Played Row -->
      <div class="mt-6">
        <RecentlyPlayedList />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserStore } from "../store/user";
import { useProfile } from "../composables/useProfile";
import type { TimeRange } from "../types/spotify";
import Welcome from "../components/Welcome.vue";
import TopArtists from "../components/TopArtists.vue";
import TopTracks from "../components/TopTracks.vue";
import RecentlyPlayedList from "../components/RecentlyPlayedList.vue";
import UserProfile from "../components/UserProfile.vue";
import TimeRangeSelector from "../components/TimeRangeSelector.vue";

const userStore = useUserStore();
const user = storeToRefs(userStore);
const { displayName, isAuthenticated, isRestoringAuth } = user;

// Get full profile data with followers
const { profile } = useProfile();

// Time range state
const timeRange = ref<TimeRange>('short_term');

// Re-check authentication on mount to handle post-auth navigation
onMounted(async () => {
  const accessToken = localStorage.getItem("spotify_access_token");
  if (accessToken && !isAuthenticated.value && !isRestoringAuth.value) {
    userStore.isRestoringAuth = true;
    try {
      await userStore.fetchSpotifyProfile();
    } catch (err) {
      console.error("Failed to restore authentication:", err);
    } finally {
      userStore.isRestoringAuth = false;
    }
  }
});
</script>
