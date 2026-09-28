// Imported first, before anything else, in server.ts — so a missing
// variable is caught here with a clear message instead of surfacing later
// as a confusing crash wherever that variable happens to get used first
// (e.g. the db pool or jwt.sign).
import dotenv from "dotenv";

dotenv.config();

const REQUIRED_ENV_VARS = [
  "JWT_SECRET",
  "DB_HOST",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
] as const;

const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `Missing required environment variable(s): ${missing.join(", ")}`,
  );
  process.exit(1);
}
