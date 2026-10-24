import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const COOKIE_NAME = "sc_token";
export const REFRESH_COOKIE_NAME = "sc_refresh_token";

export function signAccessToken(userId) {
  return jwt.sign({ sub: userId, type: "access" }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export function signRefreshToken(userId) {
  return jwt.sign({ sub: userId, type: "refresh" }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });
}

// Backward compatibility alias
export function signToken(userId) {
  return signAccessToken(userId);
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

// Backward compatibility alias
export function verifyToken(token) {
  return verifyAccessToken(token);
}

export function getCookieOptions(maxAgeMs) {
  const isProd = env.nodeEnv === "production";
  return {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: maxAgeMs,
    path: "/",
  };
}

export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie(COOKIE_NAME, accessToken, getCookieOptions(15 * 60 * 1000)); // 15 mins
  if (refreshToken) {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getCookieOptions(30 * 24 * 60 * 60 * 1000)); // 30 days
  }
}

// Backward compatibility alias
export function setAuthCookie(res, token) {
  const refreshToken = signRefreshToken(verifyAccessToken(token).sub);
  setAuthCookies(res, token, refreshToken);
}

export function clearAuthCookies(res) {
  const opts = { path: "/", sameSite: env.nodeEnv === "production" ? "none" : "lax", secure: env.nodeEnv === "production" };
  res.clearCookie(COOKIE_NAME, opts);
  res.clearCookie(REFRESH_COOKIE_NAME, opts);
}

// Backward compatibility alias
export function clearAuthCookie(res) {
  clearAuthCookies(res);
}
