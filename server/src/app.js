import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import multer from "multer";
import { env } from "./config/env.js";
import { requireAuth, optionalAuth } from "./middleware/auth.js";
import { csrfOriginCheck } from "./middleware/csrf.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sanitizeInput } from "./middleware/sanitize.js";
import { validate } from "./middleware/validate.js";
import * as auth from "./controllers/authController.js";
import * as users from "./controllers/userController.js";
import * as posts from "./controllers/postController.js";
import * as engage from "./controllers/engagementController.js";
import * as upload from "./controllers/uploadController.js";
import * as stories from "./controllers/storyController.js";
import * as misc from "./controllers/miscController.js";
import {
  commentIdParamSchema,
  commentListSchema,
  commentSchema,
  createPostSchema,
  feedQuerySchema,
  forgotPasswordSchema,
  idParamSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  updateCommentSchema,
  updatePostSchema,
  updateUserSchema,
} from "./validators/schemas.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);

  // 1. Helmet security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false, // Allows cross-origin media embeds
    }),
  );

  // 2. CORS Whitelist
  const clientOrigins = env.clientOrigin
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const corsWhitelist = new Set([
    ...clientOrigins,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://anji0522.github.io",
  ]);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || corsWhitelist.has(origin) || origin.endsWith(".github.io") || origin.endsWith(".vercel.app")) {
          callback(null, true);
        } else {
          callback(new Error(`CORS origin not allowed: ${origin}`));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    }),
  );

  // 3. Body parsers & sanitization
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(cookieParser());
  app.use(sanitizeInput);
  app.use(csrfOriginCheck);
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  // 4. Rate limiters
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many authentication attempts, please try again later" },
  });

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests from this IP, please try again later" },
  });

  // Apply general limiter to /api
  app.use("/api", apiLimiter);

  // 5. File upload handler
  const uploader = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: env.maxFileSizeMb * 1024 * 1024, files: env.maxFiles },
    fileFilter(_req, file, cb) {
      if (!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/")) {
        cb(new Error("Only image and video uploads are allowed"));
        return;
      }
      cb(null, true);
    },
  });

  // Health check
  app.get("/api/health", (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

  // Auth routes
  app.post("/api/auth/register", authLimiter, validate(registerSchema), auth.register);
  app.post("/api/auth/login", authLimiter, validate(loginSchema), auth.login);
  app.post("/api/auth/refresh", validate(refreshSchema), auth.refresh);
  app.post("/api/auth/logout", auth.logout);
  app.get("/api/auth/me", requireAuth, auth.me);
  app.post("/api/auth/forgot-password", authLimiter, validate(forgotPasswordSchema), auth.forgotPassword);
  app.post("/api/auth/reset-password", authLimiter, validate(resetPasswordSchema), auth.resetPassword);
  app.get("/api/auth/verify-email/:token", auth.verifyEmail);
  app.post("/api/auth/resend-verification", authLimiter, auth.resendVerification);

  // Users routes
  app.get("/api/users/suggestions", requireAuth, users.suggestions);
  app.get("/api/users/:id", optionalAuth, users.getUser);
  app.put("/api/users/:id", requireAuth, validate(updateUserSchema), users.updateUser);
  app.post("/api/users/:id/follow", requireAuth, validate(idParamSchema), users.followUser);
  app.delete("/api/users/:id/follow", requireAuth, validate(idParamSchema), users.unfollowUser);
  app.get("/api/users/:id/followers", optionalAuth, users.listFollowers);
  app.get("/api/users/:id/following", optionalAuth, users.listFollowing);
  app.get("/api/users/:id/posts", optionalAuth, posts.getUserPosts);

  // Posts & Feed routes
  app.post("/api/posts", requireAuth, validate(createPostSchema), posts.createPost);
  app.get("/api/feed", requireAuth, validate(feedQuerySchema), posts.getFeed);
  app.get("/api/explore", optionalAuth, posts.getExploreFeed);
  app.get("/api/posts/saved", requireAuth, posts.getSavedPosts);
  app.get("/api/posts/:id", optionalAuth, validate(idParamSchema), posts.getPost);
  app.put("/api/posts/:id", requireAuth, validate(updatePostSchema), posts.updatePost);
  app.delete("/api/posts/:id", requireAuth, validate(idParamSchema), posts.deletePost);

  // Engagement routes
  app.post("/api/posts/:id/like", requireAuth, validate(idParamSchema), engage.likePost);
  app.delete("/api/posts/:id/like", requireAuth, validate(idParamSchema), engage.unlikePost);
  app.post("/api/posts/:id/bookmark", requireAuth, validate(idParamSchema), engage.bookmarkPost);
  app.delete("/api/posts/:id/bookmark", requireAuth, validate(idParamSchema), engage.unbookmarkPost);
  app.get("/api/posts/:id/comments", optionalAuth, validate(commentListSchema), engage.listComments);
  app.post("/api/posts/:id/comments", requireAuth, validate(commentSchema), engage.addComment);
  app.put("/api/comments/:commentId", requireAuth, validate(updateCommentSchema), engage.updateComment);
  app.delete("/api/comments/:commentId", requireAuth, engage.deleteComment);
  app.post("/api/comments/:commentId/like", requireAuth, validate(commentIdParamSchema), engage.likeComment);
  app.delete("/api/comments/:commentId/like", requireAuth, validate(commentIdParamSchema), engage.unlikeComment);

  // Stories, notifications, uploads
  app.get("/api/stories", requireAuth, stories.listStories);
  app.get("/api/notifications", requireAuth, misc.listNotifications);
  app.post("/api/notifications/read", requireAuth, misc.markNotificationsRead);
  app.get("/api/friend-requests", requireAuth, misc.listFriendRequests);
  app.post("/api/friend-requests/:id", requireAuth, misc.respondFriendRequest);
  app.post("/api/upload", requireAuth, uploader.array("files", env.maxFiles), upload.uploadImages);

  // Centralized Error Handler
  app.use(errorHandler);
  return app;
}
