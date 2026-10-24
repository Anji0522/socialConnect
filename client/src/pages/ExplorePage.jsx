import { PostCard } from "@/components/PostCard";
import { UserSuggestionCard } from "@/components/UserSuggestionCard";
import { Input } from "@/components/ui/Input";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { Compass, Search, Sparkles, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("tag") ? `#${searchParams.get("tag")}` : "";

  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("posts"); // "posts" | "people"
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/api/explore").catch(() => ({ posts: [] })),
      api.get("/api/users/suggestions").catch(() => ({ users: [] })),
    ])
      .then(([exploreData, suggestionsData]) => {
        setPosts(exploreData.posts || []);
        setUsers(suggestionsData.users || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter posts or users based on search
  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) return posts;
    const term = searchTerm.toLowerCase().replace(/^#/, "");
    return posts.filter(
      (p) =>
        (p.content && p.content.toLowerCase().includes(term)) ||
        (p.author && (p.author.name.toLowerCase().includes(term) || p.author.username.toLowerCase().includes(term)))
    );
  }, [posts, searchTerm]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase().replace(/^@/, "");
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term) ||
        (u.bio && u.bio.toLowerCase().includes(term))
    );
  }, [users, searchTerm]);

  if (loading) return <FeedSkeleton />;

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="card-surface p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Explore</h1>
            <p className="text-xs text-muted-foreground">
              Discover popular posts, trending tags, and new creators
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!e.target.value) {
                searchParams.delete("tag");
                setSearchParams(searchParams);
              }
            }}
            placeholder="Search #hashtags, @users, or keywords..."
            className="pl-9"
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 pt-1 border-t border-border">
          <button
            onClick={() => setActiveTab("posts")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "posts"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Trending Posts ({filteredPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("people")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "people"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            People Suggestions ({filteredUsers.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "posts" ? (
        filteredPosts.length === 0 ? (
          <div className="card-surface p-8 text-center text-sm text-muted-foreground">
            No posts found matching &ldquo;{searchTerm}&rdquo;. Try another tag or keyword!
          </div>
        ) : (
          <>
            {/* Instagram-style 3x3 Explore Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {filteredPosts.map((post) => {
                const firstMedia = post.media && post.media[0];
                return (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted cursor-pointer"
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

            {/* Selected Post Detail modal/card preview */}
            {selectedPost && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between pb-2">
                  <h2 className="text-sm font-semibold text-muted-foreground">Post Preview</h2>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Close Preview
                  </button>
                </div>
                <PostCard
                  post={selectedPost}
                  onDelete={(id) => {
                    setPosts((p) => p.filter((x) => x.id !== id));
                    setSelectedPost(null);
                  }}
                  onUpdate={(updated) => {
                    setPosts((p) => p.map((x) => (x.id === updated.id ? updated : x)));
                    setSelectedPost(updated);
                  }}
                />
              </div>
            )}
          </>
        )
      ) : (
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="card-surface p-8 text-center text-sm text-muted-foreground">
              No people found matching &ldquo;{searchTerm}&rdquo;.
            </div>
          ) : (
            filteredUsers.map((u) => <UserSuggestionCard key={u.id} user={u} />)
          )}
        </div>
      )}
    </div>
  );
}
