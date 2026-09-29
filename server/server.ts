// entry point for any express app is the server.js file, this wires up all the routes and the error handler
import "./src/config/validateEnv.js"; // must run before db.ts (imported via router below) creates the pool
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import multer from "multer";
import swaggerUi from "swagger-ui-express";
import type { ErrorRequestHandler } from "express";

import router from "./src/routes/index.js";

import { FileTypeError } from "./src/middleware/upload.js";
import swaggerSpec from "./src/config/swagger.js";

dotenv.config();

const app = express();

app.use(helmet());
// Only our own client should be allowed to call this API from a browser —
// falls back to the client's default dev/compose port if unset.
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use("/api", router);

// Hands out a full map of every endpoint — fine for local development,
// not something to leave open on a real deployment.
if (process.env.NODE_ENV !== "production") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));
}

app.get("/", (req, res) => res.json({ status: "API running" }));

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError || err instanceof FileTypeError) {
    return res.status(400).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
};
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
