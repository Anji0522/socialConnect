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
    const firstIssue = err.issues?.[0]?.message || "Validation failed";
    return res.status(400).json({ error: firstIssue, details: err.issues });
  }
  if (err?.name === "CastError") {
    return res.status(400).json({ error: `Invalid ${err.path || "identifier"}` });
  }
  if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    return res.status(401).json({ error: "Session expired or invalid" });
  }
  if (err?.name === "MulterError") {
    return res.status(400).json({ error: err.message });
  }

  if (env.nodeEnv !== "test") {
    console.error("[ServerError]", err);
  }

  return res.status(500).json({
    error: env.nodeEnv === "production" ? "Internal server error" : err.message || "Unknown error",
  });
}
