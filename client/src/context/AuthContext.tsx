// holds the logged in user + login/logout/change password, backed by localStorage
import { createContext, useContext, useState, type ReactNode } from "react";
import api from "../api/axios";
import type { AuthResponse, User } from "../types";

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  changePassword: (
    current_password: string,
    new_password: string,
    confirm_password: string,
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email: string, password: string) {
    const response = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    const { token, user } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);

    return user;
  }

  // we are removing this api cuz signup is not needed

  // async function signup(full_name, email, password)
  // {
  //   await api.post('/auth/signup', { full_name, email, password });
  // }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {}

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  async function changePassword(
    current_password: string,
    new_password: string,
    confirm_password: string,
  ) {
    await api.post("/auth/change-password", {
      current_password,
      new_password,
      confirm_password,
    });
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
