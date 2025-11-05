import { ref, type Ref } from 'vue';

export function useAsyncData<T>() {
  const data = ref<T[]>([]) as Ref<T[]>;
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function execute(fetchFn: () => Promise<T[]>, errorMessage = 'Failed to fetch data'): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const result = await fetchFn();
      data.value = result || [];
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      error.value = errorObj.response?.data?.message || errorObj.message || errorMessage;
      console.error('Error fetching data:', err);
    } finally {
      loading.value = false;
    }
  }

  return {
    data,
    loading,
    error,
    execute,
  };
}

