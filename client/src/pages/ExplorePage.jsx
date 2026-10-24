import { PostCard } from "@/components/PostCard";
import { UserSuggestionCard } from "@/components/UserSuggestionCard";
import { Input } from "@/components/ui/Input";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";
import { Clock, Compass, Hash, Search, Sparkles, TrendingUp, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("tag") ? `#${searchParams.get("tag")}` : "";

  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Load recent searches
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("sc_recent_searches") || "[]");
      setRecentSearches(saved);
    } catch {
      // ignore
    }
  }, []);

  function saveRecentSearch(term) {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const updated = [term.trim(), ...prev.filter((t) => t.toLowerCase() !== term.toLowerCase())].slice(0, 8);
      try {
        localStorage.setItem("sc_recent_searches", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }

  function removeRecentSearch(term) {
    setRecentSearches((prev) => {
      const updated = prev.filter((t) => t !== term);
      try {
        localStorage.setItem("sc_recent_searches", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }

  // Initial load
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/api/explore").catch(() => ({ posts: [] })),
      api.get("/api/users/suggestions").catch(() => ({ users: [] })),
      api.get("/api/search?q=a").catch(() => ({ trending: [] })),
    ])
      .then(([exploreData, suggestionsData, searchData]) => {
        setPosts(exploreData.posts || []);
        setUsers(suggestionsData.users || []);
        if (searchData.trending?.length) {
          setTrendingTags(searchData.trending);
        } else {
          setTrendingTags([
            { tag: "travel", postCount: 24 },
            { tag: "photo", postCount: 19 },
            { tag: "design", postCount: 15 },
            { tag: "buildinpublic", postCount: 12 },
            { tag: "nature", postCount: 8 },
          ]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Debounced Search
  useEffect(() => {
    if (!searchTerm.trim()) return;

    setSearching(true);
    const timer = setTimeout(() => {
      api
        .get(`/api/search?q=${encodeURIComponent(searchTerm.trim())}`)
        .then((data) => {
          if (data.users?.length) setUsers(data.users);
          if (data.trending?.length) setTrendingTags(data.trending);
          saveRecentSearch(searchTerm);
        })
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredPosts = posts.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().replace(/^[#@]/, "");
    return (
      (p.content && p.content.toLowerCase().includes(term)) ||
      (p.author && (p.author.name.toLowerCase().includes(term) || p.author.username.toLowerCase().includes(term)))
    );
  });

  const filteredUsers = users.filter((u) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().replace(/^[#@]/, "");
    return (
      u.name.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      (u.bio && u.bio.toLowerCase().includes(term))
    );
  });

  if (loading) return <FeedSkeleton />;

  return (
    <div className="space-y-4">
      {/* Header & Search Bar */}
      <div className="card-surface p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Explore</h1>
            <p className="text-xs text-muted-foreground">
              Discover popular posts, trending tags, and creators
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
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                searchParams.delete("tag");
                setSearchParams(searchParams);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Trending Hashtags row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground mr-1">
            <TrendingUp className="h-3.5 w-3.5 text-primary" /> Trending:
          </span>
          {trendingTags.map((t) => (
            <button
              key={t.tag}
              onClick={() => {
                const query = `#${t.tag}`;
                setSearchTerm(query);
                saveRecentSearch(query);
              }}
              className="rounded-full bg-muted/80 px-2.5 py-0.5 text-[11px] font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition"
            >
              #{t.tag}
            </button>
          ))}
        </div>

        {/* Recent Searches */}
        {!searchTerm && recentSearches.length > 0 && (
          <div className="border-t border-border pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="h-3.5 w-3.5" /> Recent Searches
              </span>
              <button
                onClick={() => {
                  setRecentSearches([]);
                  localStorage.removeItem("sc_recent_searches");
                }}
                className="hover:underline text-[11px]"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-foreground"
                >
                  <button onClick={() => setSearchTerm(item)} className="hover:underline">
                    {item}
                  </button>
                  <button onClick={() => removeRecentSearch(item)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Switcher Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
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
            People ({filteredUsers.length})
          </button>
          {searching && <span className="text-[10px] text-muted-foreground animate-pulse ml-auto">Searching…</span>}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "posts" ? (
        filteredPosts.length === 0 ? (
          <div className="card-surface p-8 text-center text-sm text-muted-foreground">
            No posts found matching &ldquo;{searchTerm}&rdquo;. Try another keyword or tag!
          </div>
        ) : (
          <>
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
