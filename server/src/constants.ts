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
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_PAGE_SIZE = 100;

// How long a one-time document view link stays valid if it's never used.
// Once it IS used, it dies immediately regardless of this window.
export const DOCUMENT_LINK_TTL_MS = 2 * 60 * 1000;
