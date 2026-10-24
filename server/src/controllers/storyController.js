import { Follow, Story, StoryView, User } from "../models/index.js";
import { AppError, asyncHandler } from "../utils/errors.js";

export const listStories = asyncHandler(async (req, res) => {
  const follows = await Follow.find({ followerId: req.user._id }).select("followingId");
  const userIds = [req.user._id, ...follows.map((f) => f.followingId)];

  const stories = await Story.find({
    userId: { $in: userIds },
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .populate("userId", "username name avatarUrl isPrivate");

  const views = await StoryView.find({
    viewerId: req.user._id,
    storyId: { $in: stories.map((s) => s._id) },
  });
  const seen = new Set(views.map((v) => v.storyId.toString()));

  const grouped = [];
  const byUser = new Map();
  for (const story of stories) {
    if (!story.userId) continue;
    const uid = story.userId._id.toString();
    if (!byUser.has(uid)) {
      const entry = {
        user: story.userId,
        seen: true,
        items: [],
      };
      byUser.set(uid, entry);
      grouped.push(entry);
    }
    const entry = byUser.get(uid);
    entry.items.push({
      id: story._id.toString(),
      mediaUrl: story.mediaUrl,
      createdAt: story.createdAt,
      expiresAt: story.expiresAt,
      reactions: story.reactions || [],
      seen: seen.has(story._id.toString()),
    });
    if (!seen.has(story._id.toString())) entry.seen = false;
  }

  res.json({ stories: grouped });
});

export const createStory = asyncHandler(async (req, res) => {
  const { mediaUrl } = req.body;
  if (!mediaUrl) throw new AppError(400, "Media URL is required");

  const story = await Story.create({
    userId: req.user._id,
    mediaUrl,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
  });

  res.status(201).json({
    story: {
      id: story._id.toString(),
      mediaUrl: story.mediaUrl,
      createdAt: story.createdAt,
      expiresAt: story.expiresAt,
    },
  });
});

export const recordStoryView = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  const story = await Story.findById(storyId);
  if (!story) throw new AppError(404, "Story not found");

  if (story.userId.toString() !== req.user.id) {
    await StoryView.findOneAndUpdate(
      { storyId: story._id, viewerId: req.user._id },
      { $setOnInsert: { storyId: story._id, viewerId: req.user._id } },
      { upsert: true, new: true },
    );
  }

  res.json({ ok: true });
});

export const getStoryViewers = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  const story = await Story.findById(storyId);
  if (!story) throw new AppError(404, "Story not found");

  if (story.userId.toString() !== req.user.id) {
    throw new AppError(403, "Only the story owner can view viewers");
  }

  const views = await StoryView.find({ storyId: story._id })
    .sort({ createdAt: -1 })
    .populate("viewerId", "username name avatarUrl");

  res.json({
    viewers: views.map((v) => ({
      user: v.viewerId,
      viewedAt: v.createdAt,
    })),
  });
});

export const reactToStory = asyncHandler(async (req, res) => {
  const { storyId } = req.params;
  const { emoji } = req.body;
  if (!emoji) throw new AppError(400, "Emoji is required");

  const story = await Story.findById(storyId);
  if (!story) throw new AppError(404, "Story not found");

  story.reactions.push({
    userId: req.user._id,
    emoji,
    createdAt: new Date(),
  });
  await story.save();

  res.json({ ok: true, reactions: story.reactions });
});
