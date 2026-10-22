import { api } from "@/lib/api";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";

export function FriendRequestItem({ request, onDone }) {
  async function respond(status) {
    await api.post(`/api/friend-requests/${request.id}`, { status });
    onDone?.(request.id);
  }

  return (
    <div className="flex items-center gap-3">
      <Avatar src={request.from.avatarUrl} name={request.from.name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{request.from.name}</p>
        <p className="text-xs text-muted-foreground">wants to connect</p>
      </div>
      <Button size="sm" onClick={() => respond("ACCEPTED")}>
        Accept
      </Button>
      <Button size="sm" variant="secondary" onClick={() => respond("DECLINED")}>
        Decline
      </Button>
    </div>
  );
}
