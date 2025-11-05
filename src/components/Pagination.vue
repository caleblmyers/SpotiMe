<template>
  <div v-if="totalPages > 1" class="flex items-center gap-2">
    <button @click="goToPreviousPage" :disabled="currentPage === 1 || disabled"
      class="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition">
      Previous
    </button>
    <span class="text-sm text-gray-600">
      Page {{ currentPage }} of {{ totalPages }}
    </span>
    <button @click="goToNextPage" :disabled="currentPage === totalPages || disabled"
      class="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition">
      Next
    </button>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  currentPage: number;
  totalPages: number;
  disabled?: boolean;
}

interface Emits {
  (e: 'next'): void;
  (e: 'previous'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

function goToNextPage(): void {
  emit('next');
}

function goToPreviousPage(): void {
  emit('previous');
}
</script>
