<template>
  <div class="flex flex-col items-center justify-center" :class="containerClass">
    <div
      class="animate-spin rounded-full border-b-2"
      :class="computedSpinnerClass"
    ></div>
    <p v-if="message" class="mt-4 text-gray-600" :class="messageClass">
      {{ message }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  containerClass?: string;
  spinnerClass?: string;
  messageClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  message: undefined,
  size: 'md',
  containerClass: '',
  spinnerClass: '',
  messageClass: '',
});

const sizeClasses = {
  sm: 'h-6 w-6 border-b',
  md: 'h-12 w-12 border-b-2',
  lg: 'h-16 w-16 border-b-2',
};

const computedSpinnerClass = computed(() => {
  if (props.spinnerClass) return props.spinnerClass;
  return `${sizeClasses[props.size]} border-green-600`;
});
</script>

