import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useProfileStore } from '../store/profile';

export function useProfile() {
  const profileStore = useProfileStore();
  const { profile, isLoading, error } = storeToRefs(profileStore);

  // Auto-fetch on mount if not cached
  onMounted(() => {
    profileStore.fetchProfile();
  });

  return {
    profile,
    isLoading,
    error,
    fetchProfile: (force = false) => profileStore.fetchProfile(force),
  };
}

