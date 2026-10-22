import { User } from "../models/index.js";
import { COOKIE_NAME, verifyToken } from "../utils/auth.js";
import { AppError, asyncHandler } from "../utils/errors.js";

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new AppError(401, "Authentication required");
  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user) throw new AppError(401, "Invalid session");
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(401, "Invalid session");
  }
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    req.user = await User.findById(payload.sub);
  } catch {
    req.user = null;
  }
  next();
});
