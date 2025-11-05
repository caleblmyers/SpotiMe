<template>
  <div class="bg-white rounded-lg shadow-md p-4 shrink-0">
    <div class="flex items-center gap-3 flex-wrap">
      <label class="text-sm font-semibold text-gray-700 whitespace-nowrap">Time Range:</label>
      <div class="flex gap-2">
        <button
          v-for="range in timeRangeOptions"
          :key="range.value"
          @click="$emit('update:modelValue', range.value)"
          :class="[
            'px-3 py-1.5 rounded transition text-sm whitespace-nowrap',
            modelValue === range.value
              ? 'bg-green-500 text-white font-semibold'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ range.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TimeRange } from '../types/spotify';

interface Props {
  modelValue: TimeRange;
}

defineProps<Props>();
defineEmits<{
  'update:modelValue': [value: TimeRange];
}>();

const timeRangeOptions = [
  { value: 'short_term' as TimeRange, label: 'Last 4 Weeks' },
  { value: 'medium_term' as TimeRange, label: 'Last 6 Months' },
  { value: 'long_term' as TimeRange, label: 'All Time' },
];
</script>

