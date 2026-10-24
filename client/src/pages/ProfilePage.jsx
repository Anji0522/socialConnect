import { PostCard } from "@/components/PostCard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Bookmark,
  Calendar,
  Globe,
  Grid,
  LayoutList,
  Lock,
  Mail,
  MapPin,
  MoreHorizontal,
  ShieldAlert,
  User as UserIcon,
  VolumeX,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export function ProfilePage() {
  const { username } = useParams();
  const { refresh } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [viewMode, setViewMode] = useState("cards");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportToast, setReportToast] = useState("");

  useEffect(() => {
    setLoading(true);
    setActiveTab("posts");
    api
      .get(`/api/users/${username}`)
      .then(async (d) => {
        setProfile(d.user);
        try {
          const p = await api.get(`/api/users/${d.user.id}/posts`);
          setPosts(p.posts || []);
        } catch {
          setPosts([]);
        }

        if (d.user.isMe) {
          try {
            const s = await api.get("/api/posts/saved");
            setSavedPosts(s.posts || []);
          } catch {
            // ignore
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  async function toggleFollow() {
    const next = !profile.isFollowing;
    try {
      if (next) {
        const res = await api.post(`/api/users/${profile.id}/follow`);
        if (res.requested) {
          setRequested(true);
          return;
        }
      } else {
        await api.del(`/api/users/${profile.id}/follow`);
        setRequested(false);
      }
      setProfile((p) => ({
        ...p,
        isFollowing: next,
        counts: { ...p.counts, followers: p.counts.followers + (next ? 1 : -1) },
      }));
      await refresh();
    } catch {
      // ignore
    }
  }

  async function handleBlock() {
    try {
      if (profile.isBlocked) {
        await api.del(`/api/users/${profile.id}/block`);
        setProfile((p) => ({ ...p, isBlocked: false }));
      } else {
        await api.post(`/api/users/${profile.id}/block`);
        setProfile((p) => ({ ...p, isBlocked: true, isFollowing: false }));
      }
      setShowMenu(false);
    } catch {
      // ignore
    }
  }

  async function handleMute() {
    try {
      if (profile.isMuted) {
        await api.del(`/api/users/${profile.id}/mute`);
        setProfile((p) => ({ ...p, isMuted: false }));
      } else {
        await api.post(`/api/users/${profile.id}/mute`);
        setProfile((p) => ({ ...p, isMuted: true }));
      }
      setShowMenu(false);
    } catch {
      // ignore
    }
  }

  async function handleReport(e) {
    e.preventDefault();
    if (!reportReason.trim()) return;
    try {
      await api.post("/api/reports", {
        targetUserId: profile.id,
        reason: reportReason.trim(),
      });
      setReportModal(false);
      setReportReason("");
      setReportToast("Report submitted for moderation.");
      setTimeout(() => setReportToast(""), 3000);
    } catch {
      // ignore
    }
  }

  if (loading) return <FeedSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!profile) return null;

  const isPrivateLocked = profile.isPrivate && !profile.isMe && !profile.isFollowing;
  const currentDisplayPosts = activeTab === "saved" ? savedPosts : posts;

  return (
    <div className="space-y-4">
      {/* Profile Header Card */}
      <section className="card-surface overflow-hidden">
        <div className="h-36 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600">
          {profile.coverUrl && <img src={profile.coverUrl} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="px-5 pb-5">
          <div className="-mt-12 flex items-end justify-between">
            <Avatar src={profile.avatarUrl} name={profile.name} size="xl" className="border-4 border-card ring-2 ring-primary/20" />
            <div className="flex items-center gap-2">
              {profile.isMe ? (
                <Link
                  to="/settings"
                  className="inline-flex h-9 items-center rounded-full bg-muted px-4 text-xs font-semibold transition hover:bg-muted/80 shadow-sm"
                >
                  Edit profile
                </Link>
              ) : (
                <>
                  <Link
                    to={`/messages?to=${profile.id}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-muted px-3 text-xs font-semibold hover:bg-muted/80 transition"
                  >
                    <Mail className="h-3.5 w-3.5" /> Message
                  </Link>

                  <Button
                    size="sm"
                    variant={profile.isFollowing ? "secondary" : "primary"}
                    onClick={toggleFollow}
                  >
                    {requested
                      ? "Requested"
                      : profile.isFollowing
                        ? "Unfollow"
                        : "Follow"}
                  </Button>

                  {/* 3-Dots Safety Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition"
                      aria-label="More options"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {showMenu && (
                      <div className="absolute right-0 top-10 z-30 w-44 rounded-xl border border-border bg-card p-1 shadow-lg text-xs space-y-0.5">
                        <button
                          onClick={handleMute}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-muted text-foreground transition"
                        >
                          <VolumeX className="h-3.5 w-3.5" />
                          {profile.isMuted ? "Unmute user" : "Mute posts"}
                        </button>
                        <button
                          onClick={handleBlock}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-destructive/10 text-destructive transition"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                          {profile.isBlocked ? "Unblock user" : "Block user"}
                        </button>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            setReportModal(true);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-destructive/10 text-destructive transition"
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                          Report profile
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{profile.name}</h1>
              {profile.isPrivate && (
                <span title="Private Account" className="text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-muted-foreground">@{profile.username}</p>
          </div>

          {profile.bio && <p className="mt-2 text-sm leading-relaxed">{profile.bio}</p>}

          {/* Details Row: Website, Location, DOB, Gender */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {profile.website && (
              <a
                href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {profile.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {profile.location}
              </span>
            )}
            {profile.dob && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Born {profile.dob}
              </span>
            )}
            {profile.gender && (
              <span className="inline-flex items-center gap-1 capitalize">
                <UserIcon className="h-3.5 w-3.5" /> {profile.gender.replace("_", " ")}
              </span>
            )}
          </div>

          {/* Stats Bar */}
          <div className="mt-4 flex gap-6 border-t border-border/60 pt-3 text-sm">
            <Link to={`/profile/${profile.username}/followers`} className="hover:underline">
              <strong className="text-foreground">{profile.counts.followers}</strong>{" "}
              <span className="text-muted-foreground">followers</span>
            </Link>
            <Link to={`/profile/${profile.username}/following`} className="hover:underline">
              <strong className="text-foreground">{profile.counts.following}</strong>{" "}
              <span className="text-muted-foreground">following</span>
            </Link>
            <span>
              <strong className="text-foreground">{profile.counts.posts}</strong>{" "}
              <span className="text-muted-foreground">posts</span>
            </span>
          </div>
        </div>
      </section>

      {/* Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <form onSubmit={handleReport} className="card-surface w-full max-w-md p-6 space-y-3">
            <h3 className="text-sm font-bold text-foreground">Report @{profile.username}</h3>
            <p className="text-xs text-muted-foreground">
              Please specify the reason for reporting this user (spam, harassment, inappropriate content).
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the issue..."
              rows={3}
              required
              className="w-full rounded-md border border-input bg-background p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setReportModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" size="sm" disabled={!reportReason.trim()}>
                Submit Report
              </Button>
            </div>
          </form>
        </div>
      )}

      {reportToast && (
        <div className="card-surface p-3 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          ✓ {reportToast}
        </div>
      )}

      {/* Private Account Lock Banner */}
      {isPrivateLocked ? (
        <div className="card-surface p-12 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-sm font-bold">This Account is Private</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Follow this account to see their photos, videos, and stories.
          </p>
        </div>
      ) : (
        <>
          {/* Navigation Tabs & View Toggles */}
          <div className="card-surface flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("posts")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  activeTab === "posts"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Grid className="h-4 w-4" />
                Posts ({posts.length})
              </button>

              {profile.isMe && (
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    activeTab === "saved"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                  Saved ({savedPosts.length})
                </button>
              )}
            </div>

            {currentDisplayPosts.length > 0 && (
              <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`rounded p-1 transition ${
                    viewMode === "cards" ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Card view"
                >
                  <LayoutList className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded p-1 transition ${
                    viewMode === "grid" ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Posts Section */}
          {currentDisplayPosts.length === 0 ? (
            <EmptyState
              title={activeTab === "saved" ? "No saved posts yet" : "No posts yet"}
              body={
                activeTab === "saved"
                  ? "When you bookmark posts, they'll appear here."
                  : "When this person shares something, it will show up here."
              }
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {currentDisplayPosts.map((post) => {
                const firstMedia = post.media && post.media[0];
                return (
                  <div
                    key={post.id}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted cursor-pointer"
                    onClick={() => setViewMode("cards")}
                    title="Click to view card"
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
            currentDisplayPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={(id) => {
                  setPosts((p) => p.filter((x) => x.id !== id));
                  setSavedPosts((p) => p.filter((x) => x.id !== id));
                }}
                onUpdate={(updated) => {
                  setPosts((p) => p.map((x) => (x.id === updated.id ? updated : x)));
                  setSavedPosts((p) => p.map((x) => (x.id === updated.id ? updated : x)));
                }}
              />
            ))
          )}
        </>
      )}
    </div>
  );
}
