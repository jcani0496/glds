 // web/src/lib/api.js
import axios from "axios";

export const API = import.meta.env.VITE_API_URL || "http://localhost:4002";

const api = axios.create({
  baseURL: API,
  timeout: 10000,
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

export const quotesApi = {
  submit: (payload) => api.post("/quotes", payload),
  track: (token) => api.get(`/quotes/track/${token}`),
  saveDraft: (payload) => api.post("/quotes/drafts", payload),
  getDraft: (token) => api.get(`/quotes/drafts/${token}`),
};

export default api;