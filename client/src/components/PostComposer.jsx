import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ImagePlus, X } from "lucide-react";
import { useState } from "react";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Textarea";

export function PostComposer({ onCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function addFiles(list) {
    const next = [...files, ...Array.from(list)].slice(0, 10);
    setFiles(next);
  }

  async function submit(e) {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return;
    setBusy(true);
    setError("");
    try {
      let media = [];
      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const uploaded = await api.post("/api/upload", fd);
        media = uploaded.urls.map((url, position) => ({ url, position }));
      }
      const data = await api.post("/api/posts", { content, media });
      setContent("");
      setFiles([]);
      onCreated?.(data.post);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card-surface p-4">
      <div className="flex gap-3">
        <Avatar src={user?.avatarUrl} name={user?.name || "You"} />
        <div className="flex-1">
          <Textarea
            rows={3}
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
          />
          {files.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative h-16 w-16 overflow-hidden rounded-lg">
                  <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                    onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          <div className="mt-3 flex items-center justify-between">
            <label className="inline-flex cursor-pointer items-center gap-1 text-sm text-primary">
              <ImagePlus className="h-4 w-4" />
              Photos
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </label>
            <Button type="submit" variant="gradient" disabled={busy}>
              {busy ? "Posting…" : "Create new post"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
