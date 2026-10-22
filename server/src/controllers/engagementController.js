import { Comment, Like, Notification, Post } from "../models/index.js";
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

export const listComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ postId: req.params.id, parentId: null })
    .sort({ createdAt: 1 })
    .limit(Number(req.query.limit || 20))
    .populate("userId");
  res.json({
    comments: comments.map((c) => ({
      id: c._id.toString(),
      content: c.content,
      createdAt: c.createdAt,
      parentId: c.parentId,
      author: c.userId,
    })),
  });
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
      parentId: comment.parentId,
      author: comment.userId,
    },
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new AppError(404, "Comment not found");
  if (comment.userId.toString() !== req.user.id) throw new AppError(403, "Not allowed to delete this comment");
  await comment.deleteOne();
  res.json({ ok: true });
});
