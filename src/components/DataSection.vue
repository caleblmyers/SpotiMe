<template>
  <div :class="['w-full max-w-full min-w-0 bg-white rounded-lg shadow-md p-2', customClass]">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold">{{ title }}</h2>
      <slot name="header-actions" />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <p class="text-gray-500">{{ loadingMessage }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
      <button v-if="onRetry" @click="onRetry"
        class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
        Retry
      </button>
    </div>

    <!-- Content Slot -->
    <slot v-else />

    <!-- Empty State (only if no content and no error) -->
    <div v-if="!isLoading && !error && showEmpty" class="text-center py-12">
      <p class="text-gray-500">{{ emptyMessage }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useAttrs } from 'vue';

interface Props {
  title: string;
  isLoading: boolean;
  error: string | null;
  loadingMessage?: string;
  emptyMessage?: string;
  showEmpty?: boolean;
  onRetry?: () => void;
}

withDefaults(defineProps<Props>(), {
  loadingMessage: 'Loading...',
  emptyMessage: 'No data found',
  showEmpty: false,
});

const attrs = useAttrs();
const customClass = attrs.class || '';
</script>
