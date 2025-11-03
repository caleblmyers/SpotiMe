<template>
  <div class="flex flex-col items-center justify-center">
    <template v-if="!user.email">
      <p class="text-xl">Login to begin</p>
    </template>
    <template v-else>
      <button
        @click="connectWithSpotify"
        class="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition">
        Connect with Spotify
      </button>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { loginSpotify } from '../api/spotify';
import { useUserStore } from '../store/user';

const user = useUserStore();

async function connectWithSpotify() {
  await loginSpotify();
}
</script>

<style scoped></style>