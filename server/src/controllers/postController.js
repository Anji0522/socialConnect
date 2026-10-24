import mongoose from "mongoose";
import { Bookmark, Comment, Follow, Hashtag, Like, Post, User } from "../models/index.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import { bumpHashtags, extractHashtags } from "../utils/hashtags.js";
import {
  decodeCursor,
  encodeCursor,
  getFollowingIds,
  serializePosts,
} from "../utils/postMapper.js";

export const createPost = asyncHandler(async (req, res) => {
  const content = req.body.content || "";
  const location = req.body.location || "";
  const media = req.body.media || [];
  if (!content.trim() && media.length === 0) {
    throw new AppError(400, "Post needs text or at least one image");
  }
  if (media.length > 10) throw new AppError(400, "Maximum 10 images");
  const hashtags = extractHashtags(content);
  const post = await Post.create({
    userId: req.user._id,
    content,
    location,
    hashtags,
    media,
  });
  await bumpHashtags(Hashtag, hashtags);
  const populated = await Post.findById(post._id).populate("userId");
  const [serialized] = await serializePosts([populated], req.user.id);
  res.status(201).json({ post: serialized });
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("userId");
  if (!post) throw new AppError(404, "Post not found");

  // If author blocked viewer or viewer blocked author, 404
  if (
    req.user &&
    (req.user.blockedUsers?.map((b) => b.toString()).includes(post.userId?._id?.toString()) ||
      post.userId?.blockedUsers?.map((b) => b.toString()).includes(req.user.id))
  ) {
    throw new AppError(404, "Post not found");
  }

  const [serialized] = await serializePosts([post], req.user?.id);
  res.json({ post: serialized });
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError(404, "Post not found");
  if (post.userId.toString() !== req.user.id) throw new AppError(403, "Not allowed to edit this post");
  if (req.body.content !== undefined) {
    post.content = req.body.content;
    post.hashtags = extractHashtags(req.body.content);
  }
  if (req.body.location !== undefined) {
    post.location = req.body.location;
  }
  if (req.body.media !== undefined) {
    if (req.body.media.length > 10) throw new AppError(400, "Maximum 10 images");
    post.media = req.body.media;
  }
  await post.save();
  const populated = await Post.findById(post._id).populate("userId");
  const [serialized] = await serializePosts([populated], req.user.id);
  res.json({ post: serialized });
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError(404, "Post not found");
  if (post.userId.toString() !== req.user.id) throw new AppError(403, "Not allowed to delete this post");
  await Promise.all([
    Like.deleteMany({ postId: post._id }),
    Comment.deleteMany({ postId: post._id }),
    Bookmark.deleteMany({ postId: post._id }),
    post.deleteOne(),
  ]);
  res.json({ ok: true });
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) throw new AppError(404, "User not found");

  // Check private account access
  if (targetUser.isPrivate && req.user?.id !== targetUser.id) {
    const isFollower = req.user
      ? await Follow.exists({ followerId: req.user._id, followingId: targetUser._id })
      : false;
    if (!isFollower) {
      return res.json({ posts: [], privateAccount: true });
    }
  }

  const posts = await Post.find({ userId: req.params.id })
    .sort({ createdAt: -1, _id: -1 })
    .limit(30)
    .populate("userId");
  res.json({ posts: await serializePosts(posts, req.user?.id) });
});

export const getSavedPosts = asyncHandler(async (req, res) => {
  const bookmarks = await Bookmark.find({ userId: req.user._id }).sort({ createdAt: -1 });
  const postIds = bookmarks.map((b) => b.postId);
  const posts = await Post.find({ _id: { $in: postIds } }).populate("userId");
  res.json({ posts: await serializePosts(posts, req.user.id) });
});

export const getExploreFeed = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 24;
  const blocked = req.user?.blockedUsers || [];

  // Exclude private accounts (unless own) and blocked users from public explore
  const privateUsers = await User.find({ isPrivate: true, _id: { $ne: req.user?._id } }).select("_id");
  const excludeUserIds = [...blocked, ...privateUsers.map((u) => u._id)];

  const posts = await Post.find({ userId: { $nin: excludeUserIds } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId");
  res.json({ posts: await serializePosts(posts, req.user?.id) });
});

export const getFeed = asyncHandler(async (req, res) => {
  const { cursor, tab, limit } = req.query;
  const rawIds = await getFollowingIds(req.user.id, true);
  const blockedSet = new Set((req.user.blockedUsers || []).map((b) => b.toString()));
  const ids = rawIds.filter((id) => !blockedSet.has(id.toString()));

  const match = { userId: { $in: ids } };
  const decoded = decodeCursor(cursor);
  if (decoded) {
    match.$or = [
      { createdAt: { $lt: decoded.createdAt } },
      { createdAt: decoded.createdAt, _id: { $lt: new mongoose.Types.ObjectId(decoded.id) } },
    ];
  }

  let posts;
  if (tab === "popular") {
    const pipeline = [
      { $match: { userId: { $in: ids } } },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "postId",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          as: "comments",
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: [{ $size: "$likes" }, 2] },
              { $size: "$comments" },
              {
                $divide: [1, { $add: [1, { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60 * 60] }] }],
              },
            ],
          },
        },
      },
      { $sort: { score: -1, createdAt: -1 } },
      { $limit: Number(limit) + 1 },
    ];
    const raw = await Post.aggregate(pipeline);
    posts = await Post.populate(raw, { path: "userId" });
  } else {
    posts = await Post.find(match)
      .sort({ createdAt: -1, _id: -1 })
      .limit(Number(limit) + 1)
      .populate("userId");
  }

  const hasMore = posts.length > Number(limit);
  const page = hasMore ? posts.slice(0, Number(limit)) : posts;
  const nextCursor = hasMore ? encodeCursor(page[page.length - 1]) : null;
  res.json({
    posts: await serializePosts(page, req.user.id),
    nextCursor,
  });
});
