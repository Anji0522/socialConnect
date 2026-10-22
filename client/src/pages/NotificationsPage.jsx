import { NotificationList } from "@/components/NotificationList";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";

export function NotificationsPage() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get("/api/notifications").then((d) => setItems(d.notifications));
  }, []);
  return (
    <div className="card-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Notifications</h1>
        <Button
          size="sm"
          variant="secondary"
          onClick={async () => {
            await api.post("/api/notifications/read");
            setItems((n) => n.map((x) => ({ ...x, read: true })));
          }}
        >
          Mark as read
        </Button>
      </div>
      <NotificationList items={items} />
    </div>
  );
}
