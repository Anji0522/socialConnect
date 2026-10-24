import mongoose from "mongoose";
import { Follow, FriendRequest, Hashtag, Notification, Post, Report, User } from "../models/index.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import { publicProfile } from "../utils/postMapper.js";
import { emitNotification } from "../socket.js";

export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = mongoose.Types.ObjectId.isValid(id) && id.length === 24 ? { _id: id } : { username: id.toLowerCase() };
  const user = await User.findOne(query);
  if (!user) throw new AppError(404, "User not found");

  // Check if viewing user is blocked
  if (req.user && user.blockedUsers?.map((b) => b.toString()).includes(req.user.id)) {
    throw new AppError(403, "This profile is unavailable");
  }

  const profile = await publicProfile(user, req.user?.id);
  // Add block / mute status for viewer
  if (req.user) {
    profile.isBlocked = req.user.blockedUsers?.map((b) => b.toString()).includes(user._id.toString()) || false;
    profile.isMuted = req.user.mutedUsers?.map((b) => b.toString()).includes(user._id.toString()) || false;
  }
  res.json({ user: profile });
});

export const updateUser = asyncHandler(async (req, res) => {
  if (req.params.id !== req.user.id) throw new AppError(403, "You can only edit your own profile");
  const allowed = ["name", "bio", "location", "website", "gender", "dob", "isPrivate", "avatarUrl", "coverUrl"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  }
  await req.user.save();
  res.json({ user: await publicProfile(req.user, req.user.id) });
});

export const followUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) throw new AppError(400, "You cannot follow yourself");
  const target = await User.findById(req.params.id);
  if (!target) throw new AppError(404, "User not found");

  if (target.blockedUsers?.map((b) => b.toString()).includes(req.user.id)) {
    throw new AppError(403, "Cannot follow this user");
  }

  // Handle private accounts -> create FriendRequest / Follow request
  if (target.isPrivate) {
    const existingReq = await FriendRequest.findOne({ fromId: req.user._id, toId: target._id });
    if (!existingReq || existingReq.status === "DECLINED") {
      await FriendRequest.findOneAndUpdate(
        { fromId: req.user._id, toId: target._id },
        { status: "PENDING" },
        { upsert: true, new: true },
      );
      const note = await Notification.create({
        userId: target._id,
        type: "FOLLOW_REQUEST",
        actorId: req.user._id,
      });
      emitNotification(target._id, note);
    }
    return res.json({ following: false, requested: true });
  }

  try {
    await Follow.create({ followerId: req.user._id, followingId: target._id });
  } catch (err) {
    if (err?.code !== 11000) throw err;
  }

  const note = await Notification.create({
    userId: target._id,
    type: "FOLLOW",
    actorId: req.user._id,
  });
  emitNotification(target._id, note);

  return res.json({ following: true, requested: false });
});

export const unfollowUser = asyncHandler(async (req, res) => {
  await Follow.deleteOne({ followerId: req.user._id, followingId: req.params.id });
  await FriendRequest.deleteOne({ fromId: req.user._id, toId: req.params.id });
  res.json({ following: false, requested: false });
});

export const listFollowers = asyncHandler(async (req, res) => {
  const rows = await Follow.find({ followingId: req.params.id }).populate("followerId").limit(50);
  res.json({ users: rows.map((r) => r.followerId).filter(Boolean) });
});

export const listFollowing = asyncHandler(async (req, res) => {
  const rows = await Follow.find({ followerId: req.params.id }).populate("followingId").limit(50);
  res.json({ users: rows.map((r) => r.followingId).filter(Boolean) });
});

export const suggestions = asyncHandler(async (req, res) => {
  const blocked = req.user.blockedUsers || [];
  const myFollows = await Follow.find({ followerId: req.user._id }).select("followingId");
  const followingIds = myFollows.map((f) => f.followingId);
  const exclude = [req.user._id, ...followingIds, ...blocked];

  const secondDegree = await Follow.aggregate([
    { $match: { followerId: { $in: followingIds } } },
    { $match: { followingId: { $nin: exclude } } },
    { $group: { _id: "$followingId", score: { $sum: 1 } } },
    { $sort: { score: -1 } },
    { $limit: 8 },
  ]);

  let users = await User.find({ _id: { $in: secondDegree.map((s) => s._id) } });
  if (users.length < 6) {
    const fillers = await User.find({ _id: { $nin: [...exclude, ...users.map((u) => u._id)] } }).limit(
      8 - users.length,
    );
    users = [...users, ...fillers];
  }
  res.json({ users: await Promise.all(users.map((u) => publicProfile(u, req.user.id))) });
});

// Block User
export const blockUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  if (targetId === req.user.id) throw new AppError(400, "Cannot block yourself");

  if (!req.user.blockedUsers.includes(targetId)) {
    req.user.blockedUsers.push(targetId);
    await req.user.save();
  }

  // Remove mutual follows
  await Follow.deleteMany({
    $or: [
      { followerId: req.user._id, followingId: targetId },
      { followerId: targetId, followingId: req.user._id },
    ],
  });

  res.json({ blocked: true });
});

export const unblockUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  req.user.blockedUsers = req.user.blockedUsers.filter((id) => id.toString() !== targetId);
  await req.user.save();
  res.json({ blocked: false });
});

// Mute User
export const muteUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  if (targetId === req.user.id) throw new AppError(400, "Cannot mute yourself");

  if (!req.user.mutedUsers.includes(targetId)) {
    req.user.mutedUsers.push(targetId);
    await req.user.save();
  }
  res.json({ muted: true });
});

export const unmuteUser = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  req.user.mutedUsers = req.user.mutedUsers.filter((id) => id.toString() !== targetId);
  await req.user.save();
  res.json({ muted: false });
});

// Report User or Post
export const reportEntity = asyncHandler(async (req, res) => {
  const { targetUserId, targetPostId, reason } = req.body;
  if (!reason) throw new AppError(400, "Reason for reporting is required");

  await Report.create({
    reporter: req.user._id,
    targetUser: targetUserId || undefined,
    targetPost: targetPostId || undefined,
    reason,
  });

  res.status(201).json({ message: "Report submitted successfully for safety review." });
});

// Search Users & Hashtags
export const search = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) {
    return res.json({ users: [], hashtags: [], trending: [] });
  }

  const clean = q.replace(/^[#@]/, "").toLowerCase();
  const blocked = req.user?.blockedUsers || [];

  const [users, hashtags] = await Promise.all([
    User.find({
      _id: { $nin: blocked },
      $or: [
        { username: { $regex: clean, $options: "i" } },
        { name: { $regex: clean, $options: "i" } },
      ],
    })
      .limit(10)
      .lean(),
    Hashtag.find({
      tag: { $regex: clean, $options: "i" },
    })
      .sort({ postCount: -1 })
      .limit(10)
      .lean(),
  ]);

  // Also query trending hashtags
  const trending = await Hashtag.find({}).sort({ postCount: -1 }).limit(8).lean();

  res.json({
    users: await Promise.all(users.map((u) => publicProfile(u, req.user?.id))),
    hashtags: hashtags.map((h) => ({ tag: h.tag, postCount: h.postCount })),
    trending: trending.map((t) => ({ tag: t.tag, postCount: t.postCount })),
  });
});
