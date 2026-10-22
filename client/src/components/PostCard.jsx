import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { Heart, MessageCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CommentThread } from "./CommentThread";
import { MediaGrid } from "./MediaGrid";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Textarea";

export function PostCard({ post, onDelete, onUpdate }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.content);
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

  async function saveEdit() {
    const data = await api.put(`/api/posts/${post.id}`, { content: draft });
    onUpdate?.(data.post);
    setEditing(false);
  }

  async function remove() {
    await api.del(`/api/posts/${post.id}`);
    onDelete?.(post.id);
  }

  return (
    <article className="card-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/profile/${post.author.username}`} className="flex gap-3">
          <Avatar src={post.author.avatarUrl} name={post.author.name} />
          <div>
            <p className="font-semibold leading-tight">{post.author.name}</p>
            <p className="text-xs text-muted-foreground">
              @{post.author.username} · {timeAgo(post.createdAt)}
            </p>
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
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} />
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
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
            {text}{" "}
            {long && (
              <button className="font-medium text-primary" onClick={() => setExpanded((e) => !e)}>
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </p>
        )
      )}
      <MediaGrid media={post.media} />
      <div className="mt-3 flex gap-2">
        <Button variant="ghost" size="sm" onClick={toggleLike} aria-pressed={liked} aria-label="Like post">
          <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          {likeCount}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowComments((s) => !s)} aria-label="Comments">
          <MessageCircle className="h-4 w-4" />
          {post.commentCount}
        </Button>
      </div>
      {showComments && <CommentThread postId={post.id} />}
    </article>
  );
}
