import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { CornerDownRight, Heart, Pencil, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FormattedText } from "./FormattedText";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export function CommentThread({ postId, onCount }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [visible, setVisible] = useState(4);
  const [expandedReplies, setExpandedReplies] = useState({});

  useEffect(() => {
    void api.get(`/api/posts/${postId}/comments`).then((d) => {
      setComments(d.comments || []);
      const total = (d.comments || []).reduce(
        (acc, c) => acc + 1 + (c.replies?.length || 0),
        0,
      );
      onCount?.(total);
    });
  }, [postId, onCount]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const payload = {
      content: text.trim(),
      parentId: replyTo ? replyTo.id : null,
    };
    const data = await api.post(`/api/posts/${postId}/comments`, payload);
    const newComment = data.comment;

    if (replyTo) {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === replyTo.id) {
            return {
              ...c,
              replies: [...(c.replies || []), newComment],
            };
          }
          return c;
        }),
      );
      setExpandedReplies((exp) => ({ ...exp, [replyTo.id]: true }));
      setReplyTo(null);
    } else {
      setComments((prev) => [...prev, newComment]);
    }
    setText("");
    onCount?.((c) => (c || 0) + 1);
  }

  async function remove(id, parentId = null) {
    await api.del(`/api/comments/${id}`);
    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: (c.replies || []).filter((r) => r.id !== id) }
            : c,
        ),
      );
    } else {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
    onCount?.((c) => Math.max(0, (c || 1) - 1));
  }

  async function saveEdit(commentId, parentId = null) {
    if (!editText.trim()) return;
    const data = await api.put(`/api/comments/${commentId}`, { content: editText.trim() });
    const updated = data.comment;

    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: (c.replies || []).map((r) => (r.id === commentId ? { ...r, content: updated.content } : r)),
              }
            : c,
        ),
      );
    } else {
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, content: updated.content } : c)),
      );
    }
    setEditingId(null);
    setEditText("");
  }

  async function toggleCommentLike(comment, parentId = null) {
    const next = !comment.likedByMe;
    const updateFn = (c) =>
      c.id === comment.id
        ? {
            ...c,
            likedByMe: next,
            likeCount: (c.likeCount || 0) + (next ? 1 : -1),
          }
        : c;

    if (parentId) {
      setComments((prev) =>
        prev.map((root) =>
          root.id === parentId
            ? { ...root, replies: (root.replies || []).map(updateFn) }
            : root,
        ),
      );
    } else {
      setComments((prev) => prev.map(updateFn));
    }

    try {
      if (next) {
        await api.post(`/api/comments/${comment.id}/like`);
      } else {
        await api.del(`/api/comments/${comment.id}/like`);
      }
    } catch {
      // Revert on failure
    }
  }

  function toggleReplies(commentId) {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  }

  const shown = comments.slice(0, visible);

  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      {shown.map((c) => (
        <div key={c.id} className="space-y-2">
          {/* Main Comment */}
          <div className="flex items-start gap-2.5">
            <Avatar src={c.author?.avatarUrl} name={c.author?.name} size="sm" />
            <div className="flex-1">
              <div className="rounded-2xl bg-muted px-3.5 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">{c.author?.name}</span>
                  <span className="text-[11px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
                </div>

                {editingId === c.id ? (
                  <div className="mt-2 space-y-2">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="text-xs"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(c.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-xs leading-relaxed">
                    <FormattedText text={c.content} />
                  </p>
                )}
              </div>

              {/* Actions row: Reply, Like, Edit, Delete */}
              <div className="mt-1 flex items-center gap-3 px-1 text-[11px] text-muted-foreground">
                <button
                  type="button"
                  className="font-medium hover:text-foreground"
                  onClick={() => {
                    setReplyTo({ id: c.id, name: c.author?.name, username: c.author?.username });
                  }}
                >
                  Reply
                </button>

                <button
                  type="button"
                  onClick={() => toggleCommentLike(c)}
                  className={`inline-flex items-center gap-1 font-medium hover:text-red-500 ${c.likedByMe ? "text-red-500" : ""}`}
                >
                  <Heart className={`h-3 w-3 ${c.likedByMe ? "fill-red-500" : ""}`} />
                  {c.likeCount > 0 && <span>{c.likeCount}</span>}
                </button>

                {user?.id === c.author?.id && (
                  <>
                    <button
                      type="button"
                      className="inline-flex items-center gap-0.5 hover:text-foreground"
                      onClick={() => {
                        setEditingId(c.id);
                        setEditText(c.content);
                      }}
                    >
                      <Pencil className="h-2.5 w-2.5" /> Edit
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-0.5 text-destructive/80 hover:text-destructive"
                      onClick={() => remove(c.id)}
                    >
                      <Trash2 className="h-2.5 w-2.5" /> Delete
                    </button>
                  </>
                )}
              </div>

              {/* Nested Replies */}
              {(c.replies?.length || 0) > 0 && (
                <div className="mt-2 pl-4">
                  <button
                    type="button"
                    onClick={() => toggleReplies(c.id)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline"
                  >
                    <CornerDownRight className="h-3 w-3" />
                    {expandedReplies[c.id]
                      ? "Hide replies"
                      : `View ${c.replies.length} ${c.replies.length === 1 ? "reply" : "replies"}`}
                  </button>

                  {expandedReplies[c.id] && (
                    <div className="mt-2 space-y-2 border-l-2 border-muted pl-3">
                      {c.replies.map((r) => (
                        <div key={r.id} className="flex items-start gap-2">
                          <Avatar src={r.author?.avatarUrl} name={r.author?.name} size="xs" />
                          <div className="flex-1">
                            <div className="rounded-xl bg-muted/70 px-3 py-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold">{r.author?.name}</span>
                                <span className="text-[10px] text-muted-foreground">{timeAgo(r.createdAt)}</span>
                              </div>
                              {editingId === r.id ? (
                                <div className="mt-2 space-y-2">
                                  <Input
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="text-xs"
                                    autoFocus
                                  />
                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={() => saveEdit(r.id, c.id)}>
                                      Save
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="mt-0.5 text-xs">
                                  <FormattedText text={r.content} />
                                </p>
                              )}
                            </div>

                            <div className="mt-1 flex items-center gap-3 px-1 text-[11px] text-muted-foreground">
                              <button
                                type="button"
                                onClick={() => toggleCommentLike(r, c.id)}
                                className={`inline-flex items-center gap-1 font-medium hover:text-red-500 ${r.likedByMe ? "text-red-500" : ""}`}
                              >
                                <Heart className={`h-2.5 w-2.5 ${r.likedByMe ? "fill-red-500" : ""}`} />
                                {r.likeCount > 0 && <span>{r.likeCount}</span>}
                              </button>

                              {user?.id === r.author?.id && (
                                <>
                                  <button
                                    type="button"
                                    className="hover:text-foreground"
                                    onClick={() => {
                                      setEditingId(r.id);
                                      setEditText(r.content);
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="text-destructive hover:underline"
                                    onClick={() => remove(r.id, c.id)}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {comments.length > visible && (
        <button className="text-xs font-medium text-primary hover:underline" onClick={() => setVisible((v) => v + 5)}>
          Show more comments
        </button>
      )}

      {/* Reply indicator banner */}
      {replyTo && (
        <div className="flex items-center justify-between rounded-xl bg-primary/10 px-3 py-1.5 text-xs text-primary">
          <span>Replying to <strong>@{replyTo.username}</strong></span>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="hover:opacity-80"
            aria-label="Cancel reply"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Comment Form */}
      <form onSubmit={submit} className="flex gap-2 pt-1">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={replyTo ? `Reply to @${replyTo.username}...` : "Write a comment..."}
          aria-label="Write a comment"
          className="text-xs"
        />
        <Button type="submit" size="sm">
          Send
        </Button>
      </form>
    </div>
  );
}