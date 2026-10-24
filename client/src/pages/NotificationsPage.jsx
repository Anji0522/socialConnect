import { NotificationList } from "@/components/NotificationList";
import { Button } from "@/components/ui/Button";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export function NotificationsPage() {
  const [items, setItems] = useState([]);
  const { socket } = useSocket();

  useEffect(() => {
    api.get("/api/notifications").then((d) => setItems(d.notifications || []));
  }, []);

  useEffect(() => {
    if (!socket) return;
    function handleNewNotification(n) {
      setItems((prev) => [n, ...prev]);
    }
    socket.on("new_notification", handleNewNotification);
    return () => socket.off("new_notification", handleNewNotification);
  }, [socket]);

  return (
    <div className="card-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Notifications</h1>
        <Button
          size="sm"
          variant="secondary"
          onClick={async () => {
            await api.post("/api/notifications/read");
            setItems((n) => n.map((x) => ({ ...x, read: true })));
          }}
        >
          Mark all as read
        </Button>
      </div>
      <NotificationList items={items} />
    </div>
  );
}
