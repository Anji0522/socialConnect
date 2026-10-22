import { api } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export function CommentThread({ postId, onCount }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(3);

  useEffect(() => {
    void api.get(`/api/posts/${postId}/comments`).then((d) => {
      setComments(d.comments);
      onCount?.(d.comments.length);
    });
  }, [postId, onCount]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const data = await api.post(`/api/posts/${postId}/comments`, { content: text });
    setComments((c) => [...c, data.comment]);
    setText("");
    onCount?.(comments.length + 1);
  }

  async function remove(id) {
    await api.del(`/api/comments/${id}`);
    setComments((c) => c.filter((x) => x.id !== id));
  }

  const shown = comments.slice(0, visible);

  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      {shown.map((c) => (
        <div key={c.id} className="flex gap-2">
          <Avatar src={c.author.avatarUrl} name={c.author.name} size="sm" />
          <div className="flex-1 rounded-xl bg-muted px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{c.author.name}</p>
              <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
            </div>
            <p className="text-sm">{c.content}</p>
            {user?.id === c.author.id && (
              <button className="mt-1 text-xs text-destructive" onClick={() => remove(c.id)}>
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
      {comments.length > visible && (
        <button className="text-sm text-primary" onClick={() => setVisible((v) => v + 5)}>
          Show more comments
        </button>
      )}
      <form onSubmit={submit} className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          aria-label="Write a comment"
        />
        <Button type="submit" size="sm">
          Send
        </Button>
      </form>
    </div>
  );
}
