import { FriendRequest, Notification } from "../models/index.js";
import { Follow } from "../models/index.js";
import { AppError, asyncHandler } from "../utils/errors.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(12)
    .populate("actorId");
  const unread = await Notification.countDocuments({ userId: req.user._id, read: false });
  res.json({
    unread,
    notifications: items.map((n) => ({
      id: n._id.toString(),
      type: n.type,
      read: n.read,
      createdAt: n.createdAt,
      actor: n.actorId,
      postId: n.postId,
    })),
  });
});

export const markNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
  res.json({ ok: true });
});

export const listFriendRequests = asyncHandler(async (req, res) => {
  const items = await FriendRequest.find({ toId: req.user._id, status: "PENDING" })
    .populate("fromId")
    .limit(10);
  res.json({
    requests: items.map((r) => ({
      id: r._id.toString(),
      from: r.fromId,
      createdAt: r.createdAt,
    })),
  });
});

export const respondFriendRequest = asyncHandler(async (req, res) => {
  const request = await FriendRequest.findById(req.params.id);
  if (!request || request.toId.toString() !== req.user.id) throw new AppError(404, "Request not found");
  const status = req.body.status === "ACCEPTED" ? "ACCEPTED" : "DECLINED";
  request.status = status;
  await request.save();
  if (status === "ACCEPTED") {
    await Follow.findOneAndUpdate(
      { followerId: request.fromId, followingId: request.toId },
      { followerId: request.fromId, followingId: request.toId },
      { upsert: true },
    );
    await Follow.findOneAndUpdate(
      { followerId: request.toId, followingId: request.fromId },
      { followerId: request.toId, followingId: request.fromId },
      { upsert: true },
    );
  }
  res.json({ status });
});
