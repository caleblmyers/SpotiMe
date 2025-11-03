<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Welcome, {{ user.displayName }}</h1>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useUserStore } from "../store/user";
import { getTopTracks, getTopArtists } from "../api/spotify";

const user = useUserStore();
const topTracks = ref([]);
const topArtists = ref([]);
const timeRange = ref("short_term");

async function fetchStats() {
  if (!user.spotifyId) return;
  topTracks.value = await getTopTracks(user.spotifyId, timeRange.value);
  topArtists.value = await getTopArtists(user.spotifyId, timeRange.value);
}

onMounted(async () => {
  await user.fetchUser();
  await fetchStats();
});

watch(timeRange, fetchStats);
</script>
