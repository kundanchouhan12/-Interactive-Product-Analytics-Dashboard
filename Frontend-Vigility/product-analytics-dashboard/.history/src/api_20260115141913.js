import axios from "axios";


const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

// OPTIONAL: JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
