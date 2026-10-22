import { Follow, Story, StoryView } from "../models/index.js";
import { asyncHandler } from "../utils/errors.js";

export const listStories = asyncHandler(async (req, res) => {
  const follows = await Follow.find({ followerId: req.user._id }).select("followingId");
  const userIds = [req.user._id, ...follows.map((f) => f.followingId)];
  const stories = await Story.find({
    userId: { $in: userIds },
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .populate("userId");

  const views = await StoryView.find({
    viewerId: req.user._id,
    storyId: { $in: stories.map((s) => s._id) },
  });
  const seen = new Set(views.map((v) => v.storyId.toString()));

  const grouped = [];
  const byUser = new Map();
  for (const story of stories) {
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
      seen: seen.has(story._id.toString()),
    });
    if (!seen.has(story._id.toString())) entry.seen = false;
  }

  res.json({ stories: grouped });
});
