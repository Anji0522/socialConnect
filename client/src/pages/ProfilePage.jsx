import { PostCard } from "@/components/PostCard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export function ProfilePage() {
  const { username } = useParams();
  const { refresh } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/api/users/${username}`)
      .then(async (d) => {
        setProfile(d.user);
        const p = await api.get(`/api/users/${d.user.id}/posts`);
        setPosts(p.posts);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  async function toggleFollow() {
    const next = !profile.isFollowing;
    setProfile((p) => ({
      ...p,
      isFollowing: next,
      counts: { ...p.counts, followers: p.counts.followers + (next ? 1 : -1) },
    }));
    try {
      if (next) await api.post(`/api/users/${profile.id}/follow`);
      else await api.del(`/api/users/${profile.id}/follow`);
      await refresh();
    } catch {
      setProfile((p) => ({
        ...p,
        isFollowing: !next,
        counts: { ...p.counts, followers: p.counts.followers + (next ? -1 : 1) },
      }));
    }
  }

  if (loading) return <FeedSkeleton />;
  if (error) return <ErrorState message={error} />;
  if (!profile) return null;

  return (
    <div className="space-y-4">
      <section className="card-surface overflow-hidden">
        <div className="h-36 bg-gradient-to-r from-blue-500 to-indigo-600">
          {profile.coverUrl && <img src={profile.coverUrl} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="px-5 pb-5">
          <div className="-mt-12 flex items-end justify-between">
            <Avatar src={profile.avatarUrl} name={profile.name} size="xl" className="border-4 border-card" />
            {profile.isMe ? (
              <Link
                to="/settings"
                className="inline-flex h-10 items-center rounded-full bg-muted px-4 text-sm font-medium"
              >
                Edit profile
              </Link>
            ) : (
              <Button variant={profile.isFollowing ? "secondary" : "primary"} onClick={toggleFollow}>
                {profile.isFollowing ? "Unfollow" : "Follow"}
              </Button>
            )}
          </div>
          <h1 className="mt-3 text-xl font-bold">{profile.name}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
          {profile.location && (
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" /> {profile.location}
            </p>
          )}
          <div className="mt-3 flex gap-4 text-sm">
            <Link to={`/profile/${profile.username}/followers`}>
              <strong>{profile.counts.followers}</strong> followers
            </Link>
            <Link to={`/profile/${profile.username}/following`}>
              <strong>{profile.counts.following}</strong> following
            </Link>
            <span>
              <strong>{profile.counts.posts}</strong> posts
            </span>
          </div>
        </div>
      </section>
      {posts.length === 0 ? (
        <EmptyState title="No posts yet" body="When this person shares something, it will show up here." />
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDelete={(id) => setPosts((p) => p.filter((x) => x.id !== id))}
            onUpdate={(updated) => setPosts((p) => p.map((x) => (x.id === updated.id ? updated : x)))}
          />
        ))
      )}
    </div>
  );
}
