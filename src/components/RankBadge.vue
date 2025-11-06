<template>
  <div
    :class="[
      'shrink-0 flex items-center justify-center rounded-full bg-green-500 text-white font-bold shadow-lg',
      size === 'large' ? 'w-10 h-10 text-lg' : 'w-6 h-6 text-xs'
    ]">
    {{ rank }}
  </div>
</template>

<script lang="ts" setup>
interface Props {
  rank: number;
  size?: 'small' | 'large';
}

withDefaults(defineProps<Props>(), {
  size: 'small',
});
</script>

