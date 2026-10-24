import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/lib/api";
import { Check, CheckCheck, Image as ImageIcon, Send, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function MessagesPage() {
  const { user } = useAuth();
  const { socket, isUserOnline, activeMessage } = useSocket();
  const [searchParams] = useSearchParams();
  const directTarget = searchParams.get("to");

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load conversations
  useEffect(() => {
    setLoading(true);
    api
      .get("/api/conversations")
      .then((data) => {
        const convs = data.conversations || [];
        setConversations(convs);

        if (directTarget) {
          // If query param ?to=userId or username is given
          api.get(`/api/users/${directTarget}`).then((u) => {
            if (u.user) setSelectedUser(u.user);
          }).catch(() => {});
        } else if (convs.length > 0) {
          setSelectedUser((prev) => prev || convs[0].otherUser);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [directTarget]);

  // Load messages when selectedUser changes
  useEffect(() => {
    if (!selectedUser) return;
    api
      .get(`/api/messages/${selectedUser.id}`)
      .then((data) => {
        setMessages(data.messages || []);
        if (socket && data.conversationId) {
          socket.emit("mark_seen", {
            conversationId: data.conversationId,
            senderId: selectedUser.id,
          });
        }
      })
      .catch(() => {});
  }, [selectedUser, socket]);

  // Handle incoming live socket messages
  useEffect(() => {
    if (!activeMessage || !selectedUser) return;
    const isFromSelected =
      activeMessage.senderId === selectedUser.id ||
      activeMessage.sender?.id === selectedUser.id ||
      activeMessage.recipient?.id === selectedUser.id;

    if (isFromSelected) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === activeMessage.id)) return prev;
        return [...prev, activeMessage];
      });
    }
  }, [activeMessage, selectedUser]);

  // Socket typing listeners
  useEffect(() => {
    if (!socket || !selectedUser) return;

    function handleTyping({ userId }) {
      if (userId === selectedUser?.id) setIsTyping(true);
    }

    function handleStopTyping({ userId }) {
      if (userId === selectedUser?.id) setIsTyping(false);
    }

    function handleSeen({ seenBy }) {
      if (seenBy === selectedUser?.id) {
        setMessages((prev) => prev.map((m) => ({ ...m, seen: true })));
      }
    }

    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("messages_seen", handleSeen);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.off("messages_seen", handleSeen);
    };
  }, [socket, selectedUser]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleTextChange(e) {
    setText(e.target.value);
    if (!socket || !selectedUser) return;

    socket.emit("typing", { recipientId: selectedUser.id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { recipientId: selectedUser.id });
    }, 1500);
  }

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = () => setMediaPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  async function handleSend(e) {
    e?.preventDefault();
    if ((!text.trim() && !mediaFile) || !selectedUser) return;

    let mediaUrl = "";
    if (mediaFile) {
      try {
        const fd = new FormData();
        fd.append("files", mediaFile);
        const uploadRes = await api.post("/api/upload", fd);
        mediaUrl = uploadRes.urls?.[0] || "";
      } catch {
        // fallback
      }
    }

    const payload = {
      recipientId: selectedUser.id,
      text: text.trim(),
      mediaUrl,
    };

    setText("");
    setMediaFile(null);
    setMediaPreview("");

    // Optimistic UI update
    const optimisticMsg = {
      id: `temp_${Date.now()}`,
      senderId: user.id,
      sender: user,
      text: payload.text,
      mediaUrl: payload.mediaUrl,
      seen: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      if (socket && socket.connected) {
        socket.emit("send_message", payload);
      } else {
        await api.post("/api/messages", payload);
      }
    } catch {
      // ignore
    }
  }

  const filteredConvs = conversations.filter(
    (c) =>
      c.otherUser &&
      (c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="card-surface overflow-hidden rounded-2xl border border-border shadow-sm grid grid-cols-1 md:grid-cols-3 h-[750px]">
      {/* Left Sidebar: Conversations List */}
      <div className="border-r border-border flex flex-col h-full bg-card/60">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-bold">Direct Messages</h1>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="mt-2 text-xs"
          />
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/60">
          {loading ? (
            <div className="p-4 text-xs text-muted-foreground text-center">Loading chats…</div>
          ) : filteredConvs.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No conversations yet. Connect with someone to start chatting!
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const other = conv.otherUser;
              if (!other) return null;
              const online = isUserOnline(other.id);
              const isSelected = selectedUser?.id === other.id;

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedUser(other)}
                  className={`w-full flex items-center gap-3 p-3 text-left transition ${
                    isSelected ? "bg-primary/10" : "hover:bg-muted/60"
                  }`}
                >
                  <div className="relative">
                    <Avatar src={other.avatarUrl} name={other.name} size="md" />
                    {online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold truncate text-foreground">{other.name}</p>
                      {conv.unreadCount > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {conv.lastMessage?.text || (conv.lastMessage?.mediaUrl ? "📷 Photo" : `@${other.username}`)}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Side: Chat Window */}
      <div className="md:col-span-2 flex flex-col h-full bg-background">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b border-border flex items-center justify-between bg-card/40">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar src={selectedUser.avatarUrl} name={selectedUser.name} size="md" />
                  {isUserOnline(selectedUser.id) && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                  )}
                </div>
                <div>
                  <h2 className="text-xs font-bold">{selectedUser.name}</h2>
                  <p className="text-[10px] text-muted-foreground">
                    {isUserOnline(selectedUser.id) ? (
                      <span className="text-emerald-500 font-medium">● Online</span>
                    ) : (
                      `@${selectedUser.username}`
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-xs text-muted-foreground">
                  <p>Say hello to {selectedUser.name} 👋</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === user.id || m.sender?.id === user.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-xs shadow-sm ${
                          isMine
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted text-foreground rounded-bl-none"
                        }`}
                      >
                        {m.mediaUrl && (
                          <img
                            src={m.mediaUrl}
                            alt=""
                            className="rounded-lg mb-1.5 max-h-60 w-full object-cover"
                          />
                        )}
                        {m.text && <p className="leading-relaxed">{m.text}</p>}
                      </div>

                      <div className="flex items-center gap-1 mt-0.5 text-[9px] text-muted-foreground px-1">
                        <span>
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMine && (
                          <span>
                            {m.seen ? (
                              <CheckCheck className="h-3 w-3 text-primary inline" />
                            ) : (
                              <Check className="h-3 w-3 inline" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                  <span className="text-[10px]">{selectedUser.name} is typing…</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Media Attachment Preview */}
            {mediaPreview && (
              <div className="p-2 border-t border-border flex items-center gap-2 bg-muted/40">
                <img src={mediaPreview} alt="" className="h-12 w-12 rounded object-cover" />
                <span className="text-xs text-muted-foreground flex-1">Image attached</span>
                <button
                  onClick={() => {
                    setMediaFile(null);
                    setMediaPreview("");
                  }}
                  className="text-xs text-destructive hover:underline"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Input Composer */}
            <form onSubmit={handleSend} className="p-3 border-t border-border flex items-center gap-2 bg-card">
              <label className="cursor-pointer text-muted-foreground hover:text-foreground p-1 transition">
                <ImageIcon className="h-5 w-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setText((t) => `${t} ❤️`)}
                className="text-muted-foreground hover:text-foreground p-1 transition"
                title="Add emoji"
              >
                <Smile className="h-5 w-5" />
              </button>

              <Input
                value={text}
                onChange={handleTextChange}
                placeholder={`Message ${selectedUser.name}…`}
                className="flex-1 text-xs"
              />

              <Button type="submit" size="sm" disabled={!text.trim() && !mediaFile}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
            Select a conversation or user to begin messaging.
          </div>
        )}
      </div>
    </div>
  );
}
