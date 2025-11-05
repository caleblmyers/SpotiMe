import axios from "axios";
import { useUserStore } from "../store/user";
import { API_BASE_URL } from "../constants/api";

interface SpotifyApiParams {
  limit?: number;
  offset?: number;
  time_range?: string;
}

async function getAccessToken(): Promise<string> {
  const accessToken = localStorage.getItem("spotify_access_token");
  
  if (!accessToken) {
    throw new Error("No Spotify access token found");
  }

  return accessToken;
}

function getSpotifyId(): string | null {
  const user = useUserStore();
  return user.id;
}

function buildParams(params: SpotifyApiParams): Record<string, unknown> {
  const queryParams: Record<string, unknown> = {};
  if (params.limit !== undefined) queryParams.limit = params.limit;
  if (params.offset !== undefined) queryParams.offset = params.offset;
  if (params.time_range !== undefined) queryParams.time_range = params.time_range;
  return queryParams;
}

async function makeAuthenticatedRequest<T>(
  url: string,
  params?: Record<string, unknown>
): Promise<T> {
  const accessToken = await getAccessToken();
  const spotifyId = getSpotifyId();
  
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };
  
  // Include x-spotify-id header if available (optional, for automatic refresh)
  if (spotifyId) {
    headers["x-spotify-id"] = spotifyId;
  }

  try {
    const res = await axios.get(url, {
      headers,
      params,
      withCredentials: true,
    });
    return res.data;
  } catch (err: unknown) {
    const error = err as { response?: { status: number } };
    // If 401, try refreshing token and retry
    if (error.response?.status === 401) {
      const user = useUserStore();
      const newToken = await user.refreshAccessToken();
      if (newToken) {
        const retryHeaders: Record<string, string> = {
          Authorization: `Bearer ${newToken}`,
        };
        if (spotifyId) {
          retryHeaders["x-spotify-id"] = spotifyId;
        }
        const retryRes = await axios.get(url, {
          headers: retryHeaders,
          params,
          withCredentials: true,
        });
        return retryRes.data;
      }
    }
    throw err;
  }
}

export async function loginSpotify(): Promise<void> {
  const res = await axios.get(`${API_BASE_URL}/auth/login-spotify`, {
    withCredentials: true,
  });
  window.location.href = res.data.url;
}

export function parseTokensFromUrl(): { access_token: string; refresh_token: string; spotify_id?: string } | null {
  const urlParams = new URLSearchParams(window.location.search);
  const tokensParam = urlParams.get("tokens");
  
  if (!tokensParam) {
    return null;
  }

  try {
    // Decode base64 encoded tokens
    const decoded = atob(tokensParam);
    const tokens = JSON.parse(decoded);
    return tokens;
  } catch (err) {
    console.error("Failed to parse tokens from URL:", err);
    return null;
  }
}

export async function getTopArtists(
  limit?: number,
  offset?: number,
  time_range?: string
): Promise<unknown[]> {
  const params = buildParams({ limit, offset, time_range });
  return makeAuthenticatedRequest<unknown[]>(
    `${API_BASE_URL}/api/top-artists`,
    params
  );
}

export async function getTopTracks(
  limit?: number,
  offset?: number,
  time_range?: string
): Promise<unknown[]> {
  const params = buildParams({ limit, offset, time_range });
  return makeAuthenticatedRequest<unknown[]>(
    `${API_BASE_URL}/api/top-tracks`,
    params
  );
}
