import axios from "axios";

export async function login(email: string, password: string) {
  const res = await axios.post(
    `http://localhost:4000/auth/login`,
    { email, password },
    { withCredentials: true }
  );
  localStorage.setItem("token", res.data.accessToken);

  return res.data.user;
}

export async function signUp(email: string, password: string) {
  const res = await axios.post(
    `http://localhost:4000/auth/signup`,
    { email, password },
    { withCredentials: true }
  );
  if (res.data.accessToken) {
    localStorage.setItem("token", res.data.accessToken);
  }
  return res.data.user || res.data;
}
