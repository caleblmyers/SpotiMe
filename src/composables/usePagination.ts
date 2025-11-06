import { computed, ref } from 'vue';
import type { Ref } from 'vue';

export function usePagination<T>(data: Ref<T[] | null>, itemsPerPage = 10) {
  const currentPage = ref(1);

  const totalPages = computed(() => {
    if (!data.value) return 0;
    return Math.ceil(data.value.length / itemsPerPage);
  });

  const paginatedData = computed(() => {
    if (!data.value) return [];
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.value.slice(start, end);
  });

  function goToNextPage(): void {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  }

  function goToPreviousPage(): void {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  }

  function goToPage(page: number): void {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  }

  function reset(): void {
    currentPage.value = 1;
  }

  return {
    currentPage,
    totalPages,
    paginatedData,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    reset,
  };
}

