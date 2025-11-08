import { ref, watch, type Ref } from 'vue';
import axios, { type AxiosError } from 'axios';
import { API_BASE_URL } from '../constants/api';
import { useUserStore } from '../store/user';
import { getAccessToken } from '../utils/auth';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a cache key from endpoint and params
 */
function getCacheKey(endpoint: string, params?: Record<string, unknown>): string {
  const paramsStr = params ? JSON.stringify(params) : '';
  return `spotify_api_${endpoint}_${paramsStr}`;
}

/**
 * Retrieve cached data if available and not expired
 */
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

/**
 * Store data in cache with expiration
 */
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

/**
 * Create request headers with authentication
 */
function createRequestHeaders(accessToken: string, spotifyId: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };

  if (spotifyId) {
    headers['x-spotify-id'] = spotifyId;
  }

  return headers;
}

/**
 * Make an HTTP request and cache the response if needed
 */
async function makeRequest<T>(
  endpoint: string,
  headers: Record<string, string>,
  params?: Record<string, unknown>,
  useCache = true
): Promise<T> {
  const cacheKey = getCacheKey(endpoint, params);

  // Check cache first
  if (useCache) {
    const cached = getCachedData<T>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Make the request
  const res = await axios.get<T>(`${API_BASE_URL}${endpoint}`, {
    headers,
    params,
    withCredentials: true,
  });

  // Cache the response
  if (useCache) {
    setCachedData(cacheKey, res.data);
  }

  return res.data;
}

/**
 * Make an authenticated request with automatic token refresh on 401
 */
export async function makeAuthenticatedRequest<T>(
  endpoint: string,
  params?: Record<string, unknown>,
  useCache = true
): Promise<T> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error('No Spotify access token found');
  }

  const user = useUserStore();
  const spotifyId = user.id;
  const headers = createRequestHeaders(accessToken, spotifyId);

  try {
    return await makeRequest<T>(endpoint, headers, params, useCache);
  } catch (err: unknown) {
    const error = err as AxiosError<ApiError>;
    
    // Handle 401 - try refreshing token and retry
    if (error.response?.status === 401) {
      const newToken = await user.refreshAccessToken();
      if (newToken) {
        const retryHeaders = createRequestHeaders(newToken, spotifyId);
        return await makeRequest<T>(endpoint, retryHeaders, params, useCache);
      }
    }

    throw err;
  }
}

/**
 * Extract error message from API error
 */
function extractErrorMessage(err: unknown): string {
  const error = err as AxiosError<ApiError>;
  return (
    error.response?.data?.message ||
    error.message ||
    'Failed to fetch data'
  );
}

/**
 * Composable for making authenticated API requests with reactive state
 */
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
      error.value = extractErrorMessage(err);
      console.error(`Error fetching ${endpoint}:`, err);
      data.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  // Watch for token changes and refetch if no data exists
  watch(
    () => getAccessToken(),
    (newToken, oldToken) => {
      if (newToken && newToken !== oldToken && data.value === null) {
        fetchData(defaultParams, false);
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

