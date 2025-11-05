<template>
  <div class="w-full max-w-full min-w-0">
    <!-- Not Authenticated State -->
    <Welcome v-if="!isAuthenticated" />

    <!-- Authenticated State -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <!-- Left Column (40%) - User Info & Top Tracks -->
      <div class="lg:col-span-2 space-y-2">
        <!-- User Info Section -->
        <UserProfile :profile="profile" :display-name="displayName" />

        <!-- Top Tracks Section -->
        <TopTracks />
      </div>

      <!-- Right Column (60%) - Top Artists -->
      <div class="lg:col-span-3">
        <TopArtists />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useUserStore } from "../store/user";
import { useProfile } from "../composables/useProfile";
import Welcome from "../components/Welcome.vue";
import TopArtists from "../components/TopArtists.vue";
import TopTracks from "../components/TopTracks.vue";
import UserProfile from "../components/UserProfile.vue";

const userStore = useUserStore();
const user = storeToRefs(userStore);
const { displayName, isAuthenticated } = user;

// Get full profile data with followers
const { profile } = useProfile();
</script>
