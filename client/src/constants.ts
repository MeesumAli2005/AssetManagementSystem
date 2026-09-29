// Fixed values the whole client agrees on. Change them here, not at the call sites.
import type { AssetStatus, RequestStatus, RequestType } from "./types";

export const ROLES = {
  EMPLOYEE: "employee",
  ADMINISTRATOR: "administrator",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ASSET_CONDITIONS = ["new", "good", "fair", "damaged"] as const;

// Was previously copied verbatim into 5 different pages — one place now,
// so changing a color/label can't leave some pages disagreeing with others.
export const ASSET_STATUS_COLORS: Record<AssetStatus, string> = {
  available: "green",
  assigned: "amber",
  under_repair: "red",
  retired: "slate",
  disposed: "slate",
};

export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  pending: "amber",
  approved: "green",
  sent_for_repair: "amber",
  rejected: "red",
  completed: "slate",
};

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  asset: "New asset",
  return: "Return",
  repair: "Repair",
};

export const REQUEST_TYPE_COMPLETION_LABELS: Record<RequestType, string> = {
  asset: "Asset assigned",
  return: "Return completed",
  repair: "Repair completed",
};

export const TOKEN_KEY = "token";
export const USER_KEY = "user";

export const DEFAULT_API_URL = "http://172.20.2.224:5000/api";
