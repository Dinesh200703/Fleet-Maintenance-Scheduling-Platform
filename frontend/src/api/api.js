import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://127.0.0.1:8000")).replace(/\/$/, ""),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  const requestUrl = error.config?.url || "";
  const isPublicAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/signup");
  if (error.response?.status === 401 && !isPublicAuthRequest && localStorage.getItem("token")) {
    ["token", "role", "driver_id", "user_id", "user_name"].forEach((key) => localStorage.removeItem(key));
    window.dispatchEvent(new Event("fleet:session-expired"));
  }
  return Promise.reject(error);
});

export default api;
