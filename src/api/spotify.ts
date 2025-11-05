import axios from "axios";
import { useUserStore } from "../store/user";
import { API_BASE_URL } from "../constants/api";

interface SpotifyApiParams {
  limit?: number;
  offset?: number;
  time_range?: string;
}

function getAuthHeaders(): { Authorization: string; "x-user-id": string } {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const user = useUserStore();
  if (!user.id) {
    throw new Error("User ID not found");
  }

  return {
    Authorization: `Bearer ${token}`,
    "x-user-id": user.id,
  };
}

function buildParams(params: SpotifyApiParams): Record<string, unknown> {
  const queryParams: Record<string, unknown> = {};
  if (params.limit !== undefined) queryParams.limit = params.limit;
  if (params.offset !== undefined) queryParams.offset = params.offset;
  if (params.time_range !== undefined) queryParams.time_range = params.time_range;
  return queryParams;
}

export async function loginSpotify(): Promise<void> {
  const user = useUserStore();
  const res = await axios.get(`${API_BASE_URL}/auth/login-spotify`, {
    withCredentials: true,
    params: { id: user.id },
  });
  window.location.href = res.data.url;
}

export async function getTopArtists(
  limit?: number,
  offset?: number,
  time_range?: string
): Promise<unknown[]> {
  const params = buildParams({ limit, offset, time_range });
  const headers = getAuthHeaders();

  const res = await axios.get(`${API_BASE_URL}/api/top-artists`, {
    headers,
    params,
    withCredentials: true,
  });
  return res.data;
}

export async function getTopTracks(
  limit?: number,
  offset?: number,
  time_range?: string
): Promise<unknown[]> {
  const params = buildParams({ limit, offset, time_range });
  const headers = getAuthHeaders();

  const res = await axios.get(`${API_BASE_URL}/api/top-tracks`, {
    headers,
    params,
    withCredentials: true,
  });
  return res.data;
}

