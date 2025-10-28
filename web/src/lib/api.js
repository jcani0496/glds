// web/src/lib/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4002";
export const API = API_BASE;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// 👉 Adjunta token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("glds_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  // DEBUG: debería aparecer "Bearer xxxxx" cuando estés en /admin
  console.log("[api] Authorization:", config.headers.Authorization || "(sin token)");
  return config;
});

// 👉 Si hay 401, limpia token y manda a /admin/login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("glds_admin_token");
      if (location.pathname.startsWith("/admin")) {
        location.href = "/admin/login";
      }
    }
    console.error("API error:", err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;