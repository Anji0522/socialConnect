import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

export function csrfOriginCheck(req, _res, next) {
  if (SAFE.has(req.method)) return next();
  const origin = req.headers.origin;
  if (!origin) return next();
  const allowed = [env.clientOrigin, "http://localhost:5173", "http://127.0.0.1:5173"];
  if (!allowed.includes(origin)) {
    throw new AppError(403, "Invalid request origin");
  }
  next();
}
