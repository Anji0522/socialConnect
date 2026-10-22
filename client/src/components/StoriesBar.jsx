import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { StoryViewer } from "./StoryViewer";
import { Avatar } from "./ui/Avatar";
import { Skeleton } from "./ui/Skeleton";

export function StoriesBar() {
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/stories")
      .then((d) => setGroups(d.stories))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card-surface flex gap-3 overflow-x-auto p-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-16 shrink-0 rounded-full" />
        ))}
      </div>
    );
  }

  if (!groups.length) return null;

  return (
    <>
      <div className="card-surface flex gap-3 overflow-x-auto p-3" aria-label="Stories">
        {groups.map((g) => (
          <button
            key={g.user.id}
            className="flex w-16 shrink-0 flex-col items-center gap-1"
            onClick={() => setOpen(g)}
          >
            <span className={`rounded-full p-0.5 ${g.seen ? "bg-muted" : "bg-gradient-to-br from-blue-500 to-indigo-600"}`}>
              <Avatar src={g.user.avatarUrl} name={g.user.name} className="border-2 border-card" />
            </span>
            <span className="w-full truncate text-[11px]">{g.user.username}</span>
          </button>
        ))}
      </div>
      {open && <StoryViewer group={open} onClose={() => setOpen(null)} />}
    </>
  );
}
