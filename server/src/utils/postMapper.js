import mongoose from "mongoose";
import { Bookmark, Comment, Follow, Like, Post } from "../models/index.js";

export function decodeCursor(cursor) {
  if (!cursor) return null;
  const [createdAt, id] = Buffer.from(cursor, "base64url").toString("utf8").split("|");
  if (!createdAt || !id) return null;
  return { createdAt: new Date(createdAt), id };
}

export function encodeCursor(post) {
  return Buffer.from(`${post.createdAt.toISOString()}|${post._id}`).toString("base64url");
}

export async function serializePosts(posts, viewerId) {
  if (!posts.length) return [];
  const postIds = posts.map((p) => p._id);
  const userIds = posts.map((p) => p.userId._id || p.userId);

  const [likeCounts, commentCounts, liked, follows, bookmarks] = await Promise.all([
    Like.aggregate([{ $match: { postId: { $in: postIds } } }, { $group: { _id: "$postId", count: { $sum: 1 } } }]),
    Comment.aggregate([{ $match: { postId: { $in: postIds } } }, { $group: { _id: "$postId", count: { $sum: 1 } } }]),
    viewerId ? Like.find({ userId: viewerId, postId: { $in: postIds } }).select("postId") : [],
    viewerId
      ? Follow.find({ followerId: viewerId, followingId: { $in: userIds } }).select("followingId")
      : [],
    viewerId ? Bookmark.find({ userId: viewerId, postId: { $in: postIds } }).select("postId") : [],
  ]);

  const likeMap = Object.fromEntries(likeCounts.map((x) => [x._id.toString(), x.count]));
  const commentMap = Object.fromEntries(commentCounts.map((x) => [x._id.toString(), x.count]));
  const likedSet = new Set(liked.map((x) => x.postId.toString()));
  const followSet = new Set(follows.map((x) => x.followingId.toString()));
  const bookmarkSet = new Set(bookmarks.map((x) => x.postId.toString()));

  return posts.map((post) => {
    const author = post.userId?.toJSON ? post.userId.toJSON() : post.userId;
    const id = post._id.toString();
    return {
      id,
      content: post.content,
      location: post.location || "",
      hashtags: post.hashtags || [],
      media: (post.media || [])
        .sort((a, b) => a.position - b.position)
        .map((m) => ({ url: m.url, position: m.position, type: m.type || "image" })),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author,
      likeCount: likeMap[id] || 0,
      commentCount: commentMap[id] || 0,
      likedByMe: likedSet.has(id),
      bookmarkedByMe: bookmarkSet.has(id),
      followingAuthor: author?.id ? followSet.has(author.id) : false,
    };
  });
}

export async function getFollowingIds(userId, includeSelf = true) {
  const follows = await Follow.find({ followerId: userId }).select("followingId");
  const ids = follows.map((f) => f.followingId);
  if (includeSelf) ids.push(new mongoose.Types.ObjectId(userId));
  return ids;
}

export async function publicProfile(user, viewerId) {
  const [posts, followers, following, isFollowing] = await Promise.all([
    Post.countDocuments({ userId: user._id }),
    Follow.countDocuments({ followingId: user._id }),
    Follow.countDocuments({ followerId: user._id }),
    viewerId && viewerId !== user._id.toString()
      ? Follow.exists({ followerId: viewerId, followingId: user._id })
      : false,
  ]);

  const raw = user.toJSON ? user.toJSON() : user;
  return {
    ...raw,
    gender: user.gender || "",
    dob: user.dob || "",
    website: user.website || "",
    isPrivate: Boolean(user.isPrivate),
    counts: { posts, followers, following },
    isFollowing: Boolean(isFollowing),
    isMe: viewerId === user._id.toString(),
  };
}
