<template>
  <div class="flex items-start gap-4">
    <!-- Large Image -->
    <div class="shrink-0 w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
      <img v-if="imageUrl" :src="imageUrl" :alt="title" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
        {{ imagePlaceholder }}
      </div>
    </div>

    <!-- Details -->
    <div class="flex-1">
      <div class="flex items-center gap-3 mb-2">
        <RankBadge v-if="showRankBadge" :rank="rankBadgeValue" size="large" />
        <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
      </div>

      <div class="space-y-2 mb-4">
        <div v-for="(field, index) in fields" :key="index">
          <span class="text-sm font-semibold text-gray-700">{{ field.label }}: </span>
          <span class="text-sm text-gray-600">{{ field.value }}</span>
        </div>
      </div>

      <div v-if="genres && genres.length > 0">
        <span class="text-sm font-semibold text-gray-700 block mb-2">Genres:</span>
        <div class="flex flex-wrap gap-2">
          <span v-for="genre in genres" :key="genre"
            class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
            {{ genre }}
          </span>
        </div>
      </div>

      <SpotifyLinkButton v-if="spotifyUrl" :url="spotifyUrl" class="mt-4" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import RankBadge from './RankBadge.vue';
import SpotifyLinkButton from './SpotifyLinkButton.vue';

interface DetailField {
  label: string;
  value: string | number;
}

interface Props {
  title: string;
  imageUrl?: string | null;
  imagePlaceholder?: string;
  fields: DetailField[];
  genres?: string[];
  spotifyUrl?: string | null;
  showRankBadge?: boolean;
  rankBadgeValue?: number;
}

withDefaults(defineProps<Props>(), {
  imageUrl: null,
  imagePlaceholder: 'No Image',
  genres: undefined,
  spotifyUrl: null,
  showRankBadge: false,
  rankBadgeValue: 0,
});
</script>

