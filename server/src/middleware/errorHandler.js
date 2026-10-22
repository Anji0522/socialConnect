import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({ error: `${field} already exists` });
  }
  if (err?.name === "ZodError") {
    return res.status(400).json({ error: "Validation failed", details: err.issues });
  }
  if (err?.name === "MulterError") {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({
    error: env.nodeEnv === "production" ? "Internal server error" : err.message,
  });
}
