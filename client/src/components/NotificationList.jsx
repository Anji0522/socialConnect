import { timeAgo } from "@/lib/format";
import { Avatar } from "./ui/Avatar";

const labels = {
  LIKE: "liked your post",
  COMMENT: "commented on your post",
  FOLLOW: "started following you",
  MENTION: "mentioned you",
};

export function NotificationList({ items }) {
  if (!items?.length) {
    return <p className="text-sm text-muted-foreground">No recent activity.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((n) => (
        <li key={n.id} className="flex items-start gap-2">
          <Avatar src={n.actor?.avatarUrl} name={n.actor?.name || "User"} size="sm" />
          <div>
            <p className="text-sm">
              <span className="font-medium">{n.actor?.name}</span> {labels[n.type] || "updated"}
            </p>
            <p className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
