// Fixed values the whole client agrees on. Change them here, not at the call sites.
export const ROLES = {
  EMPLOYEE: "employee",
  ADMINISTRATOR: "administrator",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ASSET_CONDITIONS = ["new", "good", "fair", "damaged"] as const;

export const TOKEN_KEY = "token";
export const USER_KEY = "user";

export const DEFAULT_API_URL = "http://172.20.2.224:5000/api";
