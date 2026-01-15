// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, // if you use cookies
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // store JWT after login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
