import { z } from "zod";

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid id");
const mediaUrl = z.string().min(1);

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
    password: z.string().min(6).max(72),
    name: z.string().min(1).max(60),
    gender: z.enum(["male", "female", "custom", "prefer_not_to_say", ""]).optional().default(""),
    dob: z.string().optional().default(""),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    name: z.string().min(1).max(60).optional(),
    bio: z.string().max(280).optional(),
    location: z.string().max(80).optional(),
    website: z.string().max(120).optional(),
    gender: z.enum(["male", "female", "custom", "prefer_not_to_say", ""]).optional(),
    dob: z.string().optional(),
    isPrivate: z.boolean().optional(),
    avatarUrl: z.string().optional(),
    coverUrl: z.string().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: objectId }),
});

export const commentIdParamSchema = z.object({
  params: z.object({ commentId: objectId }),
});

export const createPostSchema = z.object({
  body: z.object({
    content: z.string().max(2000).optional().default(""),
    location: z.string().max(100).optional().default(""),
    media: z
      .array(
        z.object({
          url: mediaUrl,
          type: z.enum(["image", "video"]).optional().default("image"),
          position: z.number().int().min(0),
        }),
      )
      .max(10)
      .optional()
      .default([]),
  }),
});

export const updatePostSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    content: z.string().max(2000).optional(),
    location: z.string().max(100).optional(),
    media: z
      .array(
        z.object({
          url: mediaUrl,
          type: z.enum(["image", "video"]).optional().default("image"),
          position: z.number().int().min(0),
        }),
      )
      .max(10)
      .optional(),
  }),
});

export const feedQuerySchema = z.object({
  query: z.object({
    cursor: z.string().optional(),
    tab: z.enum(["latest", "popular"]).optional().default("latest"),
    limit: z.coerce.number().int().min(1).max(30).optional().default(10),
  }),
});

export const commentSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    content: z.string().min(1).max(500),
    parentId: objectId.optional().nullable(),
  }),
});

export const updateCommentSchema = z.object({
  params: z.object({ commentId: objectId }),
  body: z.object({
    content: z.string().min(1).max(500),
  }),
});

export const commentListSchema = z.object({
  params: z.object({ id: objectId }),
  query: z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  }),
});
