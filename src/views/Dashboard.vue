<template>
  <div class="w-full max-w-full min-w-0">
    <!-- Not Authenticated State -->
    <Welcome v-if="!isAuthenticated" />

    <!-- Authenticated State -->
    <div v-else class="space-y-4">
      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
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
        <div class="lg:col-span-3">
          <TopArtists :time-range="timeRange" />
        </div>
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
import Welcome from "../components/Welcome.vue";
import TopArtists from "../components/TopArtists.vue";
import TopTracks from "../components/TopTracks.vue";
import UserProfile from "../components/UserProfile.vue";
import TimeRangeSelector from "../components/TimeRangeSelector.vue";

const userStore = useUserStore();
const user = storeToRefs(userStore);
const { displayName, isAuthenticated } = user;

// Get full profile data with followers
const { profile } = useProfile();

// Time range state
const timeRange = ref<TimeRange>('short_term');
</script>
