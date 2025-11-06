<template>
  <div class="bg-white rounded-lg shadow-sm overflow-hidden">
    <div class="overflow-x-auto max-h-[800px] overflow-y-auto">
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
interface TableColumn {
  key: string;
  label: string;
}

interface Props {
  columns: TableColumn[];
}

defineProps<Props>();
</script>

