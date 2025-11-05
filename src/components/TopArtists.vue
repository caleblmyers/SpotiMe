<template>
  <div class="w-full max-w-full min-w-0 bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold">Top Artists</h2>
      <div v-if="totalPages > 1" class="flex items-center gap-2">
        <button @click="goToPreviousPage" :disabled="currentPage === 1 || isLoading"
          class="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition">
          Previous
        </button>
        <span class="text-sm text-gray-600">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button @click="goToNextPage" :disabled="currentPage === totalPages || isLoading"
          class="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition">
          Next
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <p class="text-gray-500">Loading artists...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
      <button @click="() => fetchTopArtists()"
        class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
        Retry
      </button>
    </div>

    <!-- Artists Grid -->
    <div v-else-if="paginatedArtists && paginatedArtists.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full max-w-full min-w-0">
      <div v-for="artist in paginatedArtists" :key="artist.id"
        class="bg-gray-50 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow w-full min-w-0">
        <!-- Artist Image -->
        <div class="aspect-square bg-gray-200 overflow-hidden">
          <img v-if="artist.images && artist.images[0]" :src="artist.images[0].url" :alt="artist.name"
            class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        </div>

        <!-- Artist Info -->
        <div class="p-3">
          <h3 class="font-semibold text-sm mb-1 truncate" :title="artist.name">
            {{ artist.name }}
          </h3>
          <div v-if="artist.genres && artist.genres.length > 0" class="flex flex-wrap gap-1">
            <span v-for="genre in artist.genres.slice(0, 2)" :key="genre"
              class="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
              {{ genre }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">No artists found</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useTopArtists } from '../composables/useTopArtists';

const ITEMS_PER_PAGE = 10;
const { artists, isLoading, error, fetchTopArtists } = useTopArtists({ limit: 50 });

const currentPage = ref(1);

const totalPages = computed(() => {
  if (!artists.value) return 0;
  return Math.ceil(artists.value.length / ITEMS_PER_PAGE);
});

const paginatedArtists = computed(() => {
  if (!artists.value) return [];
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  return artists.value.slice(start, end);
});

function goToNextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function goToPreviousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}
</script>
