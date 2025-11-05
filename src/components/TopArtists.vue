<template>
  <div class="w-full max-w-full min-w-0">
    <h2 class="text-2xl font-bold mb-4">Top Artists</h2>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <p class="text-gray-500">Loading artists...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
      <button
        @click="fetchTopArtists"
        class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Retry
      </button>
    </div>

    <!-- Artists Grid -->
    <div v-else-if="artists.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 w-full max-w-full min-w-0">
      <div
        v-for="artist in artists"
        :key="artist.id"
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow w-full min-w-0"
      >
        <!-- Artist Image -->
        <div class="aspect-square bg-gray-200 overflow-hidden">
          <img
            v-if="artist.images && artist.images[0]"
            :src="artist.images[0].url"
            :alt="artist.name"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-gray-400"
          >
            No Image
          </div>
        </div>

        <!-- Artist Info -->
        <div class="p-4">
          <h3 class="font-semibold text-lg mb-2 truncate" :title="artist.name">
            {{ artist.name }}
          </h3>

          <!-- Genres -->
          <div v-if="artist.genres && artist.genres.length > 0" class="flex flex-wrap gap-1">
            <span
              v-for="genre in artist.genres.slice(0, 3)"
              :key="genre"
              class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
            >
              {{ genre }}
            </span>
            <span
              v-if="artist.genres.length > 3"
              class="px-2 py-1 text-gray-500 text-xs"
            >
              +{{ artist.genres.length - 3 }} more
            </span>
          </div>
          <p v-else class="text-gray-400 text-sm">No genres available</p>
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
import { useTopArtists } from '../composables/useTopArtists';

const { artists, loading, error, fetchTopArtists } = useTopArtists();
</script>

