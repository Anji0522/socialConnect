import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "./ui/Avatar";

export function ContactList({ users }) {
  if (!users?.length) return <p className="px-2 text-xs text-muted-foreground">Follow people to see contacts.</p>;
  return (
    <ul className="space-y-1">
      {users.map((u, i) => {
        const online = i % 3 !== 2;
        return (
          <li key={u.id}>
            <Link
              to={`/profile/${u.username}`}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted"
            >
              <span className="relative">
                <Avatar src={u.avatarUrl} name={u.name} size="sm" />
                <span
                  className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-card ${online ? "bg-emerald-500" : "bg-zinc-400"}`}
                  aria-label={online ? "Online" : "Offline"}
                />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{u.name}</span>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
