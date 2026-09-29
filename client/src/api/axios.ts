// shared axios instance, slaps the jwt onto every outgoing request if we have one
import axios from "axios";
import { DEFAULT_API_URL, TOKEN_KEY, USER_KEY } from "../constants";

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

// A 401 here means the saved token is gone/expired/invalid (the JWT expires
// after 30 minutes — see authController.js), not just "this one request
// failed". Without this, the app kept showing the logged-in UI while every
// call silently failed. Login itself is excluded, since a wrong password is
// also a 401 and isn't a reason to wipe out an existing session.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
