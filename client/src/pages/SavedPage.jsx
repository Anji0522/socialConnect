import { PostCard } from "@/components/PostCard";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { Bookmark, Grid, LayoutList } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function SavedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "grid"

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/posts/saved")
      .then((data) => setPosts(data.posts || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FeedSkeleton />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-4">
      <div className="card-surface flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bookmark className="h-5 w-5 fill-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Saved Posts</h1>
            <p className="text-xs text-muted-foreground">
              {posts.length} {posts.length === 1 ? "saved post" : "saved posts"} • Only you can see what you&apos;ve saved
            </p>
          </div>
        </div>

        {posts.length > 0 && (
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            <button
              onClick={() => setViewMode("cards")}
              className={`rounded p-1.5 transition ${
                viewMode === "cards" ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Feed card view"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded p-1.5 transition ${
                viewMode === "grid" ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {posts.length === 0 ? (
        <EmptyState
          title="No saved posts yet"
          body="Save photos and videos that you want to see again. No one is notified, and only you can see what you've saved."
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {posts.map((post) => {
            const firstMedia = post.media && post.media[0];
            return (
              <div
                key={post.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
              >
                {firstMedia ? (
                  firstMedia.type === "video" ? (
                    <video src={firstMedia.url} className="h-full w-full object-cover" />
                  ) : (
                    <img
                      src={firstMedia.url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-3 text-center text-xs text-muted-foreground">
                    <p className="line-clamp-4">{post.content}</p>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-4 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 text-white text-sm font-semibold">
                  <span>❤️ {post.likeCount || 0}</span>
                  <span>💬 {post.commentCount || 0}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={(id) => setPosts((p) => p.filter((x) => x.id !== id))}
              onUpdate={(updated) => setPosts((p) => p.map((x) => (x.id === updated.id ? updated : x)))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
