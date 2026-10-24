import { Bookmark, Comment, Like, Notification, Post } from "../models/index.js";
import { AppError, asyncHandler } from "../utils/errors.js";

export const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError(404, "Post not found");
  try {
    await Like.create({ userId: req.user._id, postId: post._id });
    if (post.userId.toString() !== req.user.id) {
      await Notification.create({
        userId: post.userId,
        type: "LIKE",
        actorId: req.user._id,
        postId: post._id,
      });
    }
  } catch (err) {
    if (err?.code !== 11000) throw err;
  }
  const likeCount = await Like.countDocuments({ postId: post._id });
  res.json({ liked: true, likeCount });
});

export const unlikePost = asyncHandler(async (req, res) => {
  await Like.deleteOne({ userId: req.user._id, postId: req.params.id });
  const likeCount = await Like.countDocuments({ postId: req.params.id });
  res.json({ liked: false, likeCount });
});

export const bookmarkPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError(404, "Post not found");
  try {
    await Bookmark.create({ userId: req.user._id, postId: post._id });
  } catch (err) {
    if (err?.code !== 11000) throw err;
  }
  res.json({ bookmarked: true });
});

export const unbookmarkPost = asyncHandler(async (req, res) => {
  await Bookmark.deleteOne({ userId: req.user._id, postId: req.params.id });
  res.json({ bookmarked: false });
});

export const listComments = asyncHandler(async (req, res) => {
  const allComments = await Comment.find({ postId: req.params.id })
    .sort({ createdAt: 1 })
    .populate("userId");

  const viewerId = req.user?.id;
  const formatComment = (c) => ({
    id: c._id.toString(),
    content: c.content,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    parentId: c.parentId ? c.parentId.toString() : null,
    author: c.userId,
    likeCount: (c.likes || []).length,
    likedByMe: viewerId ? (c.likes || []).some((id) => id.toString() === viewerId) : false,
  });

  const roots = [];
  const repliesMap = {};

  for (const c of allComments) {
    const parentId = c.parentId ? c.parentId.toString() : null;
    const formatted = formatComment(c);
    if (!parentId) {
      formatted.replies = [];
      roots.push(formatted);
      repliesMap[formatted.id] = formatted.replies;
    } else {
      if (!repliesMap[parentId]) repliesMap[parentId] = [];
      repliesMap[parentId].push(formatted);
    }
  }

  res.json({ comments: roots });
});

export const addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError(404, "Post not found");
  const comment = await Comment.create({
    userId: req.user._id,
    postId: post._id,
    parentId: req.body.parentId || null,
    content: req.body.content,
  });
  if (post.userId.toString() !== req.user.id) {
    await Notification.create({
      userId: post.userId,
      type: "COMMENT",
      actorId: req.user._id,
      postId: post._id,
    });
  }
  await comment.populate("userId");
  res.status(201).json({
    comment: {
      id: comment._id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      parentId: comment.parentId ? comment.parentId.toString() : null,
      author: comment.userId,
      likeCount: 0,
      likedByMe: false,
      replies: [],
    },
  });
});

export const updateComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new AppError(404, "Comment not found");
  if (comment.userId.toString() !== req.user.id) throw new AppError(403, "Not allowed to edit this comment");
  comment.content = req.body.content;
  await comment.save();
  await comment.populate("userId");
  res.json({
    comment: {
      id: comment._id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      parentId: comment.parentId ? comment.parentId.toString() : null,
      author: comment.userId,
      likeCount: (comment.likes || []).length,
      likedByMe: (comment.likes || []).some((id) => id.toString() === req.user.id),
    },
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new AppError(404, "Comment not found");
  if (comment.userId.toString() !== req.user.id) throw new AppError(403, "Not allowed to delete this comment");
  await Comment.deleteMany({ parentId: comment._id });
  await comment.deleteOne();
  res.json({ ok: true });
});

export const likeComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new AppError(404, "Comment not found");
  if (!comment.likes.some((id) => id.toString() === req.user.id)) {
    comment.likes.push(req.user._id);
    await comment.save();
  }
  res.json({ liked: true, likeCount: comment.likes.length });
});

export const unlikeComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new AppError(404, "Comment not found");
  comment.likes = comment.likes.filter((id) => id.toString() !== req.user.id);
  await comment.save();
  res.json({ liked: false, likeCount: comment.likes.length });
});
