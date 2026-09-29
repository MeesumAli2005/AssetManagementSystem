// Augments Express's own Request type with the `user` property requireAuth/
// requireAuthOptional attach after verifying a JWT. Every controller reads
// req.user — without this, TypeScript has no idea that property exists.
import type { AuthenticatedUser } from "./types.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
