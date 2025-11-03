import axios from "axios";
import { useUserStore } from "../store/user";

export async function getTopTracks(userId: string, range = "short_term") {
  const res = await axios.get(`http://localhost:4000/api/top-tracks`, {
    params: { userId, range },
    withCredentials: true,
  });
  return res.data;
}

export async function getTopArtists(userId: string, range = "short_term") {
  const res = await axios.get(`http://localhost:4000/api/top-artists`, {
    params: { userId, range },
    withCredentials: true,
  });
  return res.data;
}

export async function loginSpotify() {
  const user = useUserStore();
  const res = await axios.get(`http://localhost:4000/auth/login-spotify`, {
    withCredentials: true,
    params: { id: user.id }
  });
  console.log(res.data);
  window.location.href = res.data.url;
}

