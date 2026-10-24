import { api } from "@/lib/api";
import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { StoryViewer } from "./StoryViewer";
import { Avatar } from "./ui/Avatar";
import { Skeleton } from "./ui/Skeleton";
import { useAuth } from "@/context/AuthContext";

export function StoriesBar() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadStories();
  }, []);

  function loadStories() {
    api
      .get("/api/stories")
      .then((d) => setGroups(d.stories || []))
      .finally(() => setLoading(false));
  }

  async function handleAddStory(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      const res = await api.post("/api/upload", fd);
      const mediaUrl = res.urls?.[0];
      if (mediaUrl) {
        await api.post("/api/stories", { mediaUrl });
        loadStories();
      }
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="card-surface flex gap-3 overflow-x-auto p-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-16 shrink-0 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="card-surface flex items-center gap-3 overflow-x-auto p-3 scrollbar-none" aria-label="Stories">
        {/* Current user Add Story Button */}
        {user && (
          <div className="flex w-16 shrink-0 flex-col items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative rounded-full p-0.5"
            >
              <Avatar src={user.avatarUrl} name={user.name} className="border-2 border-card" />
              <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card shadow-sm">
                <Plus className="h-3 w-3 stroke-[3]" />
              </span>
            </button>
            <span className="w-full truncate text-center text-[10px] text-muted-foreground font-medium">
              {uploading ? "Posting…" : "Your story"}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleAddStory}
            />
          </div>
        )}

        {/* Following Users Stories */}
        {groups.map((g) => (
          <button
            key={g.user.id}
            className="flex w-16 shrink-0 flex-col items-center gap-1 transition transform active:scale-95"
            onClick={() => setOpen(g)}
          >
            <span
              className={`rounded-full p-0.5 transition ${
                g.seen ? "bg-muted" : "bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 shadow-sm"
              }`}
            >
              <Avatar src={g.user.avatarUrl} name={g.user.name} className="border-2 border-card" />
            </span>
            <span className="w-full truncate text-[11px] text-foreground">{g.user.username}</span>
          </button>
        ))}
      </div>

      {open && <StoryViewer group={open} onClose={() => setOpen(null)} />}
    </>
  );
}
