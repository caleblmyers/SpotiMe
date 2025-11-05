<template>
  <div class="w-full max-w-full min-w-0">
    <!-- Not Authenticated State -->
    <Welcome v-if="!isAuthenticated" />

    <!-- Authenticated State -->
    <div v-else class="space-y-6">
      <!-- User Info Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center gap-4">
          <!-- Profile Picture -->
          <div class="shrink-0">
            <img v-if="profile?.images && profile.images[0]" :src="profile.images[0].url"
              :alt="profile?.display_name || 'User'"
              class="w-20 h-20 rounded-full object-cover border-2 border-green-500" />
            <div v-else
              class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-green-500">
              <span class="text-2xl text-gray-400">{{ (profile?.display_name || displayName || 'U')[0]?.toUpperCase() ||
                'U' }}</span>
            </div>
          </div>

          <!-- User Info -->
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl font-bold text-gray-900 truncate">{{ profile?.display_name || displayName || 'User' }}
            </h1>
            <p v-if="profile?.email" class="text-gray-600 text-sm truncate">{{ profile.email }}</p>
            <div v-if="profile?.followers" class="mt-2 text-sm text-gray-500">
              <span class="font-semibold">{{ profile.followers.total.toLocaleString() }}</span> followers
            </div>
          </div>
        </div>
      </div>

      <!-- Top Artists Section -->
      <TopArtists />

      <!-- Top Tracks Section -->
      <TopTracks />
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

const userStore = useUserStore();
const user = storeToRefs(userStore);
const { displayName, isAuthenticated } = user;

// Get full profile data with followers
const { profile } = useProfile();
</script>
