import { api } from "@/lib/api";
import { compressImage } from "@/lib/imageCompression";
import { useAuth } from "@/context/AuthContext";
import { ImagePlus, MapPin, Video, X } from "lucide-react";
import { useState } from "react";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Textarea";

export function PostComposer({ onCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [showLocation, setShowLocation] = useState(false);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState("");

  async function addFiles(list) {
    if (!list?.length) return;
    setCompressing(true);
    try {
      const incoming = Array.from(list).slice(0, 10 - files.length);
      const processed = await Promise.all(
        incoming.map((file) => compressImage(file)),
      );
      setFiles((prev) => [...prev, ...processed].slice(0, 10));
    } finally {
      setCompressing(false);
    }
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
        media = uploaded.urls.map((url, position) => ({
          url,
          position,
          type: files[position]?.type?.startsWith("video/") ? "video" : "image",
        }));
      }
      const data = await api.post("/api/posts", {
        content,
        location: location.trim(),
        media,
      });
      setContent("");
      setLocation("");
      setShowLocation(false);
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
            placeholder="What's on your mind? Share updates, photos or #hashtags..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
          />

          {showLocation && (
            <div className="mt-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location (e.g. San Francisco, CA)"
                className="w-full rounded-xl border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setLocation("");
                  setShowLocation(false);
                }}
              >
                ✕
              </button>
            </div>
          )}

          {compressing && (
            <p className="mt-2 text-xs text-muted-foreground animate-pulse">
              Optimizing images for faster loading...
            </p>
          )}

          {files.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {files.map((f, i) => {
                const isVideo = f.type.startsWith("video/");
                return (
                  <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border bg-muted">
                    {isVideo ? (
                      <div className="grid h-full w-full place-items-center bg-black/80 text-white">
                        <Video className="h-6 w-6" />
                      </div>
                    ) : (
                      <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                    )}
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                      onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                      aria-label="Remove media"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

          <div className="mt-3 flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80">
                <ImagePlus className="h-4 w-4" />
                Photos/Videos
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </label>

              <button
                type="button"
                onClick={() => setShowLocation((s) => !s)}
                className={`inline-flex items-center gap-1 text-xs font-medium ${location ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <MapPin className="h-4 w-4" />
                {location ? location : "Location"}
              </button>
            </div>

            <Button type="submit" variant="gradient" disabled={busy || compressing}>
              {busy ? "Posting…" : "Create new post"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
