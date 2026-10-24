import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import {
  Bookmark,
  Check,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CommentThread } from "./CommentThread";
import { FormattedText } from "./FormattedText";
import { MediaGrid } from "./MediaGrid";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Textarea";

export function PostCard({ post, onDelete, onUpdate }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [bookmarked, setBookmarked] = useState(post.bookmarkedByMe || false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.content);
  const [draftLocation, setDraftLocation] = useState(post.location || "");
  const [copied, setCopied] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  const long = (post.content || "").length > 180;
  const text = !expanded && long ? `${post.content.slice(0, 180)}…` : post.content;
  const mine = user?.id === post.author?.id;

  async function toggleLike() {
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      const data = next
        ? await api.post(`/api/posts/${post.id}/like`)
        : await api.del(`/api/posts/${post.id}/like`);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    }
  }

  function handleDoubleTap() {
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 900);
    if (!liked) {
      void toggleLike();
    }
  }

  async function toggleBookmark() {
    const next = !bookmarked;
    setBookmarked(next);
    try {
      if (next) {
        await api.post(`/api/posts/${post.id}/bookmark`);
      } else {
        await api.del(`/api/posts/${post.id}/bookmark`);
      }
    } catch {
      setBookmarked(!next);
    }
  }

  async function copyShareLink() {
    const url = `${window.location.origin}${window.location.pathname}#/profile/${post.author.username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  async function saveEdit() {
    const data = await api.put(`/api/posts/${post.id}`, { content: draft, location: draftLocation });
    onUpdate?.(data.post);
    setEditing(false);
  }

  async function remove() {
    await api.del(`/api/posts/${post.id}`);
    onDelete?.(post.id);
  }

  return (
    <article className="card-surface p-4 transition-all">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/profile/${post.author.username}`} className="flex gap-3">
          <Avatar src={post.author.avatarUrl} name={post.author.name} />
          <div>
            <p className="font-semibold leading-tight hover:underline">{post.author.name}</p>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span>@{post.author.username}</span>
              <span>·</span>
              <span>{timeAgo(post.createdAt)}</span>
              {post.location && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-0.5 text-primary">
                    <MapPin className="h-3 w-3" />
                    {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </Link>
        {mine && (
          <div className="relative">
            <Button variant="ghost" size="icon" aria-label="Post actions" onClick={() => setMenu((m) => !m)}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {menu && (
              <div className="absolute right-0 z-10 w-36 rounded-xl border bg-card p-1 shadow-card">
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => {
                    setEditing(true);
                    setMenu(false);
                  }}
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-muted"
                  onClick={remove}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} placeholder="Edit caption..." />
          <input
            type="text"
            value={draftLocation}
            onChange={(e) => setDraftLocation(e.target.value)}
            placeholder="Location"
            className="w-full rounded-xl border bg-background px-3 py-1.5 text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveEdit}>
              Save
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        post.content && (
          <div className="mt-3 whitespace-pre-wrap text-sm leading-6">
            <FormattedText text={text} />{" "}
            {long && (
              <button className="font-medium text-primary hover:underline ml-1" onClick={() => setExpanded((e) => !e)}>
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )
      )}

      {/* Media Grid with Double-tap Heart Animation */}
      <div className="relative">
        <MediaGrid media={post.media} onDoubleTap={handleDoubleTap} />
        {showHeartAnim && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center animate-ping">
            <Heart className="h-24 w-24 fill-white text-white drop-shadow-xl" />
          </div>
        )}
      </div>

      {/* Engagement Actions Bar */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleLike} aria-pressed={liked} aria-label="Like post">
            <Heart className={`h-4 w-4 transition-transform active:scale-125 ${liked ? "fill-red-500 text-red-500" : ""}`} />
            <span>{likeCount}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowComments((s) => !s)} aria-label="Comments">
            <MessageCircle className="h-4 w-4" />
            <span>{commentCount}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={copyShareLink} aria-label="Share post">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
            <span className="text-xs">{copied ? "Copied" : "Share"}</span>
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleBookmark}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
          aria-pressed={bookmarked}
        >
          <Bookmark className={`h-4 w-4 transition ${bookmarked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        </Button>
      </div>

      {showComments && <CommentThread postId={post.id} onCount={setCommentCount} />}
    </article>
  );
}
