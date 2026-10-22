import { z } from "zod";

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid id");
const mediaUrl = z.string().min(1);

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
    password: z.string().min(8).max(72),
    name: z.string().min(1).max(60),
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
    avatarUrl: z.string().optional(),
    coverUrl: z.string().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: objectId }),
});

export const createPostSchema = z.object({
  body: z.object({
    content: z.string().max(2000).optional().default(""),
    media: z
      .array(z.object({ url: mediaUrl, position: z.number().int().min(0) }))
      .max(10)
      .optional()
      .default([]),
  }),
});

export const updatePostSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    content: z.string().max(2000).optional(),
    media: z.array(z.object({ url: mediaUrl, position: z.number().int().min(0) })).max(10).optional(),
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

export const commentListSchema = z.object({
  params: z.object({ id: objectId }),
  query: z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  }),
});
