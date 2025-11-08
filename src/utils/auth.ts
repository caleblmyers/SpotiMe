/**
 * Authentication utility functions
 * Centralized access to authentication tokens
 */

const ACCESS_TOKEN_KEY = 'spotify_access_token';
const REFRESH_TOKEN_KEY = 'spotify_refresh_token';

/**
 * Get the access token from localStorage
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get the refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if an access token exists
 */
export function hasAccessToken(): boolean {
  return !!getAccessToken();
}

