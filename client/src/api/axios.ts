// shared axios instance, slaps the jwt onto every outgoing request if we have one
import axios from "axios";
import { DEFAULT_API_URL, TOKEN_KEY } from "../constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? DEFAULT_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
