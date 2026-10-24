import { ContactList } from "@/components/ContactList";
import { FriendRequestItem } from "@/components/FriendRequestItem";
import { NotificationList } from "@/components/NotificationList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserSuggestionCard } from "@/components/UserSuggestionCard";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/lib/api";
import {
  Bell,
  Bookmark,
  Compass,
  Home,
  LogOut,
  MessageCircle,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

const nav = [
  { to: "/", label: "Feed", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/profile/me", label: "Profile", icon: UserIcon },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { unreadMsgCount } = useSocket();
  const [suggestions, setSuggestions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notes, setNotes] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.get("/api/users/suggestions").then((d) => setSuggestions(d.users));
    api.get("/api/friend-requests").then((d) => setRequests(d.requests));
    api.get("/api/notifications").then((d) => setNotes(d.notifications));
    api.get(`/api/users/${user.id}/following`).then((d) => setContacts(d.users.slice(0, 8)));
  }, [user]);

  const unread = notes.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-3 py-4 lg:grid-cols-[260px_minmax(0,1fr)_300px] lg:px-6">
        <aside className="hidden lg:sticky lg:top-4 lg:flex lg:h-[calc(100vh-2rem)] lg:flex-col">
          <Link to="/" className="mb-6 text-xl font-bold text-primary">
            SocialConnect
          </Link>
          <nav className="space-y-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to === "/profile/me" ? `/profile/${user?.username}` : item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {item.label === "Messages" && unreadMsgCount > 0 && (
                  <span className="ml-auto rounded-full bg-primary px-2 text-xs text-white">{unreadMsgCount}</span>
                )}
                {item.label === "Notifications" && unread > 0 && (
                  <span className="ml-auto rounded-full bg-primary px-2 text-xs text-white">{unread}</span>
                )}
              </NavLink>
            ))}
          </nav>
          {user && (
            <Link to={`/profile/${user.username}`} className="card-surface mt-6 p-3">
              <div className="flex items-center gap-3">
                <Avatar src={user.avatarUrl} name={user.name} />
                <div>
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 text-center text-xs">
                <div>
                  <p className="font-semibold">{user.counts?.posts ?? 0}</p>
                  <p className="text-muted-foreground">Posts</p>
                </div>
                <div>
                  <p className="font-semibold">{user.counts?.followers ?? 0}</p>
                  <p className="text-muted-foreground">Followers</p>
                </div>
                <div>
                  <p className="font-semibold">{user.counts?.following ?? 0}</p>
                  <p className="text-muted-foreground">Following</p>
                </div>
              </div>
            </Link>
          )}
          <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
            <p className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">Contacts</p>
            <ContactList users={contacts} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <ThemeToggle />
            <button className="inline-flex items-center gap-2 text-sm text-muted-foreground" onClick={logout}>
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </aside>

        <main className="min-w-0 pb-20 lg:pb-4">
          <header className="mb-4 flex items-center justify-between lg:hidden">
            <Link to="/" className="text-lg font-bold text-primary">
              SocialConnect
            </Link>
            <ThemeToggle />
          </header>
          <Outlet />
        </main>

        <aside className="hidden space-y-4 lg:sticky lg:top-4 lg:block lg:h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <section className="card-surface p-4">
            <h2 className="mb-3 font-semibold">Follow requests</h2>
            <div className="space-y-3">
              {requests.length === 0 && <p className="text-sm text-muted-foreground">No pending requests.</p>}
              {requests.map((r) => (
                <FriendRequestItem key={r.id} request={r} onDone={(id) => setRequests((list) => list.filter((x) => x.id !== id))} />
              ))}
            </div>
          </section>
          <section className="card-surface p-4">
            <h2 className="mb-3 font-semibold">Suggestions for you</h2>
            <div className="space-y-3">
              {suggestions.map((u) => (
                <UserSuggestionCard key={u.id} user={u} compact />
              ))}
            </div>
          </section>
          <section className="card-surface p-4">
            <h2 className="mb-3 font-semibold">Live activity</h2>
            <NotificationList items={notes.slice(0, 5)} />
          </section>
          <footer className="px-2 text-xs text-muted-foreground">
            <p>About · Help · Privacy · Terms</p>
            <p className="mt-1">© {new Date().getFullYear()} SocialConnect</p>
          </footer>
        </aside>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t bg-card lg:hidden">
        {nav.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to === "/profile/me" ? `/profile/${user?.username}` : item.to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2 text-[11px] ${isActive ? "text-primary" : "text-muted-foreground"}`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
