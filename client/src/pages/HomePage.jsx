import { InfiniteScrollFeed } from "@/components/InfiniteScrollFeed";
import { PostComposer } from "@/components/PostComposer";
import { StoriesBar } from "@/components/StoriesBar";
import { cn } from "@/lib/cn";
import { useState } from "react";

export function HomePage() {
  const [tab, setTab] = useState("latest");
  const [extraPost, setExtraPost] = useState(null);

  return (
    <div className="space-y-4">
      <StoriesBar />
      <PostComposer onCreated={setExtraPost} />
      <div className="flex gap-2">
        {["latest", "popular"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium capitalize",
              tab === t ? "bg-primary text-white" : "bg-muted",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <InfiniteScrollFeed tab={tab} extraPost={extraPost} />
    </div>
  );
}
