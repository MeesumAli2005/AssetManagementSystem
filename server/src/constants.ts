// Fixed values the whole server agrees on. Change them here, not at the call sites.
export const ROLES = {
  EMPLOYEE: "employee",
  ADMINISTRATOR: "administrator",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ASSET_CONDITIONS = ["new", "good", "fair", "damaged"] as const;
export const USAGE_STATES = ["active", "dormant"] as const;
export const REQUEST_TYPES = ["asset", "return", "repair"] as const;

export const BCRYPT_SALT_ROUNDS = 10;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
