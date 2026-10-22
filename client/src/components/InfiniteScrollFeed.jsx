import { api } from "@/lib/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { PostCard } from "./PostCard";
import { EmptyState, ErrorState } from "./ui/EmptyState";
import { FeedSkeleton } from "./ui/Skeleton";

export function InfiniteScrollFeed({ tab, extraPost }) {
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const sentinel = useRef(null);

  const load = useCallback(
    async (reset = false) => {
      try {
        setError("");
        if (reset) setLoading(true);
        const params = new URLSearchParams({ tab, limit: "8" });
        if (!reset && cursor) params.set("cursor", cursor);
        const data = await api.get(`/api/feed?${params}`);
        setPosts((prev) => (reset ? data.posts : [...prev, ...data.posts]));
        setCursor(data.nextCursor);
        setHasMore(Boolean(data.nextCursor));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [tab, cursor],
  );

  useEffect(() => {
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    void (async () => {
      try {
        setLoading(true);
        const data = await api.get(`/api/feed?tab=${tab}&limit=8`);
        setPosts(data.posts);
        setCursor(data.nextCursor);
        setHasMore(Boolean(data.nextCursor));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [tab]);

  useEffect(() => {
    if (extraPost) setPosts((p) => [extraPost, ...p.filter((x) => x.id !== extraPost.id)]);
  }, [extraPost]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) void load(false);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, load]);

  if (loading && posts.length === 0) return <FeedSkeleton />;
  if (error && posts.length === 0) return <ErrorState message={error} onRetry={() => load(true)} />;
  if (!posts.length) {
    return (
      <EmptyState
        title="Your feed is quiet"
        body="Follow people from suggestions to see posts here. Your own posts always appear."
      />
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onDelete={(id) => setPosts((p) => p.filter((x) => x.id !== id))}
          onUpdate={(updated) => setPosts((p) => p.map((x) => (x.id === updated.id ? updated : x)))}
        />
      ))}
      <div ref={sentinel} className="h-8" />
      {loading && <p className="text-center text-sm text-muted-foreground">Loading more…</p>}
    </div>
  );
}
