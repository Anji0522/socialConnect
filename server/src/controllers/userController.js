import mongoose from "mongoose";
import { Follow, Notification, User } from "../models/index.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import { publicProfile } from "../utils/postMapper.js";

export const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = mongoose.Types.ObjectId.isValid(id) && id.length === 24 ? { _id: id } : { username: id.toLowerCase() };
  const user = await User.findOne(query);
  if (!user) throw new AppError(404, "User not found");
  res.json({ user: await publicProfile(user, req.user?.id) });
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
  try {
    await Follow.create({ followerId: req.user._id, followingId: target._id });
  } catch (err) {
    if (err?.code !== 11000) throw err;
  }
  await Notification.create({
    userId: target._id,
    type: "FOLLOW",
    actorId: req.user._id,
  });
  res.json({ following: true });
});

export const unfollowUser = asyncHandler(async (req, res) => {
  await Follow.deleteOne({ followerId: req.user._id, followingId: req.params.id });
  res.json({ following: false });
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
  const myFollows = await Follow.find({ followerId: req.user._id }).select("followingId");
  const followingIds = myFollows.map((f) => f.followingId);
  const exclude = [req.user._id, ...followingIds];

  const secondDegree = await Follow.aggregate([
    { $match: { followerId: { $in: followingIds } } },
    { $match: { followingId: { $nin: exclude } } },
    { $group: { _id: "$followingId", score: { $sum: 1 } } },
    { $sort: { score: -1 } },
    { $limit: 8 },
  ]);

  let users = await User.find({ _id: { $in: secondDegree.map((s) => s._id) } });
  if (users.length < 6) {
    const fillers = await User.find({ _id: { $nin: [...exclude, ...users.map((u) => u._id)] } }).limit(8 - users.length);
    users = [...users, ...fillers];
  }
  res.json({ users });
});
