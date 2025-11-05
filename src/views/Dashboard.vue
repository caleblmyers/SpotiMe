<template>
  <div class="w-full max-w-full min-w-0">
    <div class="text-2xl font-bold mb-4">Welcome, {{ displayName || 'User' }}</div>
    <TopArtists />
    <div class="mt-8">
      <TopTracks />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useUserStore } from "../store/user";
import TopArtists from "../components/TopArtists.vue";
import TopTracks from "../components/TopTracks.vue";

const user = useUserStore();
const { displayName } = storeToRefs(user);
</script>
