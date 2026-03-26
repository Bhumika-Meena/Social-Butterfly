import apiClient from "./apiClient";

export async function signupApi({ username, email, password }) {
  const res = await apiClient.post("/api/auth/signup", { username, email, password });
  return res.data;
}

export async function loginApi({ email, password }) {
  const res = await apiClient.post("/api/auth/login", { email, password });
  return res.data;
}

export async function meApi(token) {
  const res = await apiClient.get("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

