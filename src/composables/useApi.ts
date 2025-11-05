import { ref, watch, type Ref } from 'vue';
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';
import { useUserStore } from '../store/user';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(endpoint: string, params?: Record<string, unknown>): string {
  const paramsStr = params ? JSON.stringify(params) : '';
  return `spotify_api_${endpoint}_${paramsStr}`;
}

function getCachedData<T>(cacheKey: string): T | null {
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    if (Date.now() > entry.expiresAt) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

function setCachedData<T>(cacheKey: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION,
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.warn('Failed to cache data:', error);
  }
}

export async function makeAuthenticatedRequest<T>(
  endpoint: string,
  params?: Record<string, unknown>,
  useCache = true
): Promise<T> {
  const accessToken = localStorage.getItem('spotify_access_token');
  if (!accessToken) {
    throw new Error('No Spotify access token found');
  }

  const user = useUserStore();
  const spotifyId = user.id;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  if (spotifyId) {
    headers['x-spotify-id'] = spotifyId;
  }

  // Check cache first
  if (useCache) {
    const cacheKey = getCacheKey(endpoint, params);
    const cached = getCachedData<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    const res = await axios.get(`${API_BASE_URL}${endpoint}`, {
      headers,
      params,
      withCredentials: true,
    });

    // Cache the response
    if (useCache) {
      const cacheKey = getCacheKey(endpoint, params);
      setCachedData(cacheKey, res.data);
    }

    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { status: number }; message?: string };
    
    // Handle 401 - try refreshing token
    if (error.response?.status === 401) {
      const newToken = await user.refreshAccessToken();
      if (newToken) {
        // Retry with new token
        const retryHeaders: Record<string, string> = {
          Authorization: `Bearer ${newToken}`,
        };
        if (spotifyId) {
          retryHeaders['x-spotify-id'] = spotifyId;
        }

        const retryRes = await axios.get(`${API_BASE_URL}${endpoint}`, {
          headers: retryHeaders,
          params,
          withCredentials: true,
        });

        // Cache the response
        if (useCache) {
          const cacheKey = getCacheKey(endpoint, params);
          setCachedData(cacheKey, retryRes.data);
        }

        return retryRes.data;
      }
    }

    throw err;
  }
}

export function useApi<T>(
  endpoint: string,
  defaultParams?: Record<string, unknown>
) {
  const data = ref<T | null>(null) as Ref<T | null>;
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchData(
    params?: Record<string, unknown>,
    useCache = true
  ): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const mergedParams = { ...defaultParams, ...params };
      const result = await makeAuthenticatedRequest<T>(endpoint, mergedParams, useCache);
      data.value = result;
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      error.value =
        errorObj.response?.data?.message ||
        errorObj.message ||
        'Failed to fetch data';
      console.error(`Error fetching ${endpoint}:`, err);
      data.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  // Watch for token changes and refetch
  watch(
    () => localStorage.getItem('spotify_access_token'),
    (newToken, oldToken) => {
      if (newToken && newToken !== oldToken && data.value === null) {
        // Token changed and we don't have data, refetch
        fetchData(defaultParams, false); // Don't use cache on token change
      }
    }
  );

  return {
    data,
    isLoading,
    error,
    fetchData,
  };
}

