import { api } from "@/lib/api";
import { Eye, Send, X } from "lucide-react";
import { useEffect, useState } from "react";

export function StoryViewer({ group, onClose }) {
  const [i, setI] = useState(0);
  const [reply, setReply] = useState("");
  const [reactions, setReactions] = useState([]);
  const [showViewers, setShowViewers] = useState(false);
  const [viewersList, setViewersList] = useState([]);
  const [sentToast, setSentToast] = useState("");

  const item = group.items[i];
  const isOwner = group.user?.isMe;

  // Record story view
  useEffect(() => {
    if (item?.id) {
      api.post(`/api/stories/${item.id}/view`).catch(() => {});
    }
  }, [item?.id]);

  // Load viewers if owner
  useEffect(() => {
    if (isOwner && item?.id) {
      api
        .get(`/api/stories/${item.id}/viewers`)
        .then((d) => setViewersList(d.viewers || []))
        .catch(() => {});
    }
  }, [isOwner, item?.id]);

  // Auto advance slide timer
  useEffect(() => {
    if (showViewers) return; // pause when viewing viewer list
    const t = setTimeout(() => {
      if (i < group.items.length - 1) setI((n) => n + 1);
      else onClose();
    }, 4500);
    return () => clearTimeout(t);
  }, [i, group.items.length, onClose, showViewers]);

  async function handleReact(emoji) {
    if (!item?.id) return;
    setReactions((prev) => [...prev, emoji]);
    try {
      await api.post(`/api/stories/${item.id}/react`, { emoji });
      setSentToast(`Reacted with ${emoji}`);
      setTimeout(() => setSentToast(""), 2000);
    } catch {
      // ignore
    }
  }

  async function handleSendReply(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    try {
      await api.post("/api/messages", {
        recipientId: group.user.id,
        text: `Replied to your story: "${reply.trim()}"`,
      });
      setReply("");
      setSentToast("Reply sent in Direct Messages!");
      setTimeout(() => setSentToast(""), 2500);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4 select-none backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-zinc-950 shadow-2xl border border-white/10">
        {/* Progress bars */}
        <div className="absolute left-2 right-2 top-2 z-20 flex gap-1">
          {group.items.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 overflow-hidden rounded bg-white/30">
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  idx < i ? "w-full" : idx === i ? "w-full animate-pulse" : "w-0"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Header: User details & Close button */}
        <div className="absolute left-3 right-3 top-5 z-20 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <img src={group.user.avatarUrl} alt="" className="h-8 w-8 rounded-full border border-white/30 object-cover" />
            <span className="text-xs font-semibold drop-shadow">{group.user.name}</span>
            <span className="text-[10px] text-white/70">
              {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => setShowViewers(!showViewers)}
                className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[11px] font-medium text-white backdrop-blur hover:bg-black/70"
              >
                <Eye className="h-3.5 w-3.5" />
                {viewersList.length}
              </button>
            )}
            <button className="text-white hover:text-white/80 p-1" onClick={onClose} aria-label="Close story">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Click zones for Previous / Next */}
        <div
          className="absolute left-0 top-16 bottom-24 w-1/3 z-10 cursor-pointer"
          onClick={() => i > 0 && setI((n) => n - 1)}
          title="Previous slide"
        />
        <div
          className="absolute right-0 top-16 bottom-24 w-1/3 z-10 cursor-pointer"
          onClick={() => (i < group.items.length - 1 ? setI((n) => n + 1) : onClose())}
          title="Next slide"
        />

        {/* Story Media */}
        <div className="relative h-[68vh] w-full bg-black flex items-center justify-center">
          <img src={item.mediaUrl} alt="" className="h-full w-full object-cover" />

          {/* Floating animated reactions */}
          <div className="absolute bottom-6 right-4 flex flex-col gap-1 pointer-events-none">
            {reactions.slice(-4).map((r, idx) => (
              <span key={idx} className="text-2xl animate-bounce">
                {r}
              </span>
            ))}
          </div>

          {sentToast && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/80 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur">
              {sentToast}
            </div>
          )}
        </div>

        {/* Viewer list drawer overlay */}
        {showViewers && (
          <div className="absolute inset-x-0 bottom-0 top-16 z-30 bg-black/95 p-4 text-white overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <h3 className="text-xs font-bold flex items-center gap-1.5">
                <Eye className="h-4 w-4" /> Viewed by ({viewersList.length})
              </h3>
              <button onClick={() => setShowViewers(false)} className="text-xs text-white/70 hover:text-white">
                Close
              </button>
            </div>
            {viewersList.length === 0 ? (
              <p className="text-xs text-white/50 text-center py-8">No views yet.</p>
            ) : (
              <div className="space-y-2">
                {viewersList.map((v, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img src={v.user.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                      <span>{v.user.name}</span>
                    </div>
                    <span className="text-[10px] text-white/50">
                      {new Date(v.viewedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer: Emoji Bar & Quick Reply Input */}
        {!isOwner && (
          <div className="p-3 bg-black border-t border-white/10 space-y-2">
            <div className="flex justify-around text-lg">
              {["🔥", "❤️", "😂", "😮", "😢", "👏"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="transition transform hover:scale-125 active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <form onSubmit={handleSendReply} className="flex items-center gap-2">
              <input
                type="text"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={`Reply to ${group.user.name}…`}
                className="flex-1 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/50"
              />
              <button
                type="submit"
                disabled={!reply.trim()}
                className="text-white hover:text-white/80 disabled:opacity-40 p-1"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
