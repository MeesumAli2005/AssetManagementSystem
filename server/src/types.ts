import type { Role } from "./constants.js";

// Shared server-side types. Grown as controllers get converted — start
// with just what auth.js needs.

// The JWT payload shape signed in authController.js's login handler
// (jwt.sign({ id, email, role }, ...)) — this is what requireAuth /
// requireAuthOptional put on req.user after verifying a token.
export interface AuthenticatedUser {
  id: number;
  email: string;
  role: Role;
}
