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
import { validate } from "./middleware/validate.js";
import * as auth from "./controllers/authController.js";
import * as users from "./controllers/userController.js";
import * as posts from "./controllers/postController.js";
import * as engage from "./controllers/engagementController.js";
import * as upload from "./controllers/uploadController.js";
import * as stories from "./controllers/storyController.js";
import * as misc from "./controllers/miscController.js";
import {
  commentListSchema,
  commentSchema,
  createPostSchema,
  feedQuerySchema,
  idParamSchema,
  loginSchema,
  registerSchema,
  updatePostSchema,
  updateUserSchema,
} from "./validators/schemas.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: [env.clientOrigin, "http://localhost:5173", "http://127.0.0.1:5173"],
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(csrfOriginCheck);
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many auth attempts, try again later" },
  });

  const uploader = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: env.maxFileSizeMb * 1024 * 1024, files: env.maxFiles },
    fileFilter(_req, file, cb) {
      if (!file.mimetype.startsWith("image/")) {
        cb(new Error("Only image uploads are allowed"));
        return;
      }
      cb(null, true);
    },
  });

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.post("/api/auth/register", authLimiter, validate(registerSchema), auth.register);
  app.post("/api/auth/login", authLimiter, validate(loginSchema), auth.login);
  app.post("/api/auth/logout", auth.logout);
  app.get("/api/auth/me", requireAuth, auth.me);

  app.get("/api/users/suggestions", requireAuth, users.suggestions);
  app.get("/api/users/:id", optionalAuth, users.getUser);
  app.put("/api/users/:id", requireAuth, validate(updateUserSchema), users.updateUser);
  app.post("/api/users/:id/follow", requireAuth, validate(idParamSchema), users.followUser);
  app.delete("/api/users/:id/follow", requireAuth, validate(idParamSchema), users.unfollowUser);
  app.get("/api/users/:id/followers", optionalAuth, users.listFollowers);
  app.get("/api/users/:id/following", optionalAuth, users.listFollowing);
  app.get("/api/users/:id/posts", optionalAuth, posts.getUserPosts);

  app.post("/api/posts", requireAuth, validate(createPostSchema), posts.createPost);
  app.get("/api/feed", requireAuth, validate(feedQuerySchema), posts.getFeed);
  app.get("/api/posts/:id", optionalAuth, validate(idParamSchema), posts.getPost);
  app.put("/api/posts/:id", requireAuth, validate(updatePostSchema), posts.updatePost);
  app.delete("/api/posts/:id", requireAuth, validate(idParamSchema), posts.deletePost);

  app.post("/api/posts/:id/like", requireAuth, validate(idParamSchema), engage.likePost);
  app.delete("/api/posts/:id/like", requireAuth, validate(idParamSchema), engage.unlikePost);
  app.get("/api/posts/:id/comments", optionalAuth, validate(commentListSchema), engage.listComments);
  app.post("/api/posts/:id/comments", requireAuth, validate(commentSchema), engage.addComment);
  app.delete("/api/comments/:commentId", requireAuth, engage.deleteComment);

  app.get("/api/stories", requireAuth, stories.listStories);
  app.get("/api/notifications", requireAuth, misc.listNotifications);
  app.post("/api/notifications/read", requireAuth, misc.markNotificationsRead);
  app.get("/api/friend-requests", requireAuth, misc.listFriendRequests);
  app.post("/api/friend-requests/:id", requireAuth, misc.respondFriendRequest);
  app.post("/api/upload", requireAuth, uploader.array("files", env.maxFiles), upload.uploadImages);

  app.use(errorHandler);
  return app;
}
