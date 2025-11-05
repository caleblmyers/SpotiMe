import axios from "axios";
import { API_BASE_URL } from "../constants/api";

export async function login(email: string, password: string) {
  const res = await axios.post(
    `${API_BASE_URL}/auth/login`,
    { email, password },
    { withCredentials: true }
  );
  localStorage.setItem("token", res.data.accessToken);

  return res.data.user;
}

export async function signUp(email: string, password: string) {
  const res = await axios.post(
    `${API_BASE_URL}/auth/signup`,
    { email, password },
    { withCredentials: true }
  );
  if (res.data.accessToken) {
    localStorage.setItem("token", res.data.accessToken);
  }
  return res.data.user || res.data;
}
