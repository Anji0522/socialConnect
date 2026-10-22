import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

export function FollowListPage({ mode }) {
  const { username } = useParams();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get(`/api/users/${username}`).then(async (d) => {
      const path = mode === "followers" ? "followers" : "following";
      const res = await api.get(`/api/users/${d.user.id}/${path}`);
      setUsers(res.users);
    });
  }, [username, mode]);

  return (
    <div className="card-surface p-4">
      <h1 className="mb-4 text-lg font-semibold capitalize">{mode}</h1>
      {users.length === 0 && <EmptyState title="Nobody here yet" body="This list is empty." />}
      <ul className="space-y-3">
        {users.map((u) => (
          <li key={u.id}>
            <Link to={`/profile/${u.username}`} className="flex items-center gap-3">
              <Avatar src={u.avatarUrl} name={u.name} />
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-muted-foreground">@{u.username}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
