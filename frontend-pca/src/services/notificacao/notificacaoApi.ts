import axios from "axios";

const notificacaoApi = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

notificacaoApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sem redirect em 401 — falha silenciosamente para não forçar logout durante polling
notificacaoApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default notificacaoApi;
