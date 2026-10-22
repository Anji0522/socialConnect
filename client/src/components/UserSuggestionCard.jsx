import { api } from "@/lib/api";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";

export function UserSuggestionCard({ user, compact }) {
  const [following, setFollowing] = useState(Boolean(user.isFollowing));
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next = !following;
    setFollowing(next);
    try {
      if (next) await api.post(`/api/users/${user.id}/follow`);
      else await api.del(`/api/users/${user.id}/follow`);
    } catch {
      setFollowing(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`flex items-center gap-3 ${compact ? "" : "card-surface p-3"}`}>
      <Link to={`/profile/${user.username}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar src={user.avatarUrl} name={user.name} size={compact ? "sm" : "md"} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
        </div>
      </Link>
      <Button size="sm" variant={following ? "secondary" : "primary"} onClick={toggle} disabled={busy}>
        {following ? "Following" : "Follow"}
      </Button>
    </div>
  );
}
