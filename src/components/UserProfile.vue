<template>
  <div class="bg-white rounded-lg shadow-md p-2">
    <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4">
      <!-- Profile Picture -->
      <div class="shrink-0">
        <img v-if="profile?.images && profile.images[0]" :src="profile.images[0].url"
          :alt="profile?.display_name || 'User'"
          class="w-20 h-20 rounded-full object-cover border-2 border-green-500" />
        <div v-else
          class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-green-500">
          <span class="text-2xl text-gray-400">
            {{ getInitial(profile?.display_name || displayName || 'U') }}
          </span>
        </div>
      </div>

      <!-- User Info -->
      <div class="flex-1 min-w-0 text-center sm:text-left">
        <h1 class="text-2xl font-bold text-gray-900 truncate">
          {{ profile?.display_name || displayName || 'User' }}
        </h1>
        <p v-if="profile?.email" class="text-gray-600 text-sm truncate">
          {{ profile.email }}
        </p>
        <div v-if="profile?.followers" class="mt-2 text-sm text-gray-500">
          <span class="font-semibold">{{ profile.followers.total.toLocaleString() }}</span>
          followers
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { SpotifyUser } from '../types/spotify';

interface Props {
  profile?: SpotifyUser | null;
  displayName?: string | null;
}

withDefaults(defineProps<Props>(), {
  profile: null,
  displayName: null,
});

function getInitial(name: string): string {
  return name[0]?.toUpperCase() || 'U';
}
</script>
