// Short-lived, single-use tokens for viewing an uploaded document. An admin
// clicking "View" mints one of these (see documentController.createDocumentAccessLink),
// and the resulting URL only ever serves the file once — whoever fetches it
// first gets it, and every request after that gets a 404, including the
// original admin reopening the same link.
//
// Kept in memory on purpose: these tokens are only ever meant to live for a
// couple of minutes, so losing them on a server restart costs nothing worse
// than the admin clicking "View" again.
import crypto from "crypto";
import { DOCUMENT_LINK_TTL_MS } from "../constants.js";

interface TokenEntry {
  filePath: string;
  expiresAt: number;
}

const tokens = new Map<string, TokenEntry>();

function sweepExpired() {
  const now = Date.now();
  for (const [token, entry] of tokens) {
    if (entry.expiresAt <= now) tokens.delete(token);
  }
}

export function mintDocumentToken(filePath: string): string {
  sweepExpired();
  const token = crypto.randomBytes(32).toString("hex");
  tokens.set(token, { filePath, expiresAt: Date.now() + DOCUMENT_LINK_TTL_MS });
  return token;
}

// Returns the file path on first (valid, unexpired) use, and deletes the
// token immediately so no second request — from the same browser or any
// other — can ever succeed with it again.
export function consumeDocumentToken(token: string): string | null {
  const entry = tokens.get(token);
  if (!entry) return null;
  tokens.delete(token);
  if (entry.expiresAt <= Date.now()) return null;
  return entry.filePath;
}
