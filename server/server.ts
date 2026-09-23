// entry point for any express app is the server.js file, this wires up all the routes and the error handler
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import swaggerUi from "swagger-ui-express";
import type { ErrorRequestHandler } from "express";

import router from "./src/routes/index.js";

import { FileTypeError } from "./src/middleware/upload.js";
import swaggerSpec from "./src/config/swagger.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", router);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (req, res) => res.json(swaggerSpec)); 

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
