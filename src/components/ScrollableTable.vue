<template>
  <div class="bg-white rounded-lg shadow-sm overflow-hidden" :class="{ 'flex-1 flex flex-col min-h-0': !hasMaxHeight }">
    <div class="overflow-x-auto overflow-y-auto" :class="{ 'flex-1 min-h-0': !hasMaxHeight }" :style="hasMaxHeight && maxHeight ? { maxHeight } : {}">
      <table class="w-full">
        <thead class="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <slot />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface TableColumn {
  key: string;
  label: string;
}

interface Props {
  columns: TableColumn[];
  maxHeight?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  maxHeight: '800px',
});

const hasMaxHeight = computed(() => props.maxHeight !== null && props.maxHeight !== undefined);
</script>

