import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { getStoredToken } from "@/lib/api";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [activeMessage, setActiveMessage] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setOnlineUsers(new Set());
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const token = getStoredToken();

    try {
      const socket = io(apiUrl, {
        auth: { token },
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnectionAttempts: 3,
        timeout: 5000,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        // Connected to real-time server
      });

      socket.on("online_users", (users) => {
        setOnlineUsers(new Set(users));
      });

      socket.on("user_status", ({ userId, status }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          if (status === "online") next.add(userId);
          else next.delete(userId);
          return next;
        });
      });

      socket.on("new_message", (msg) => {
        setActiveMessage(msg);
        if (msg.recipient && msg.recipient.id === user.id) {
          setUnreadMsgCount((c) => c + 1);
        }
      });

      socket.on("connect_error", () => {
        // Gracefully ignore if offline or running in mock static mode
      });

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    } catch {
      // Ignore in static sandbox environments
    }
  }, [user]);

  function isUserOnline(userId) {
    if (!userId) return false;
    return onlineUsers.has(userId.toString());
  }

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        onlineUsers,
        isUserOnline,
        unreadMsgCount,
        setUnreadMsgCount,
        activeMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext) || {
    socket: null,
    onlineUsers: new Set(),
    isUserOnline: () => false,
    unreadMsgCount: 0,
    setUnreadMsgCount: () => {},
    activeMessage: null,
  };
}
