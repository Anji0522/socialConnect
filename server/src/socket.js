import { Server } from "socket.io";
import { User, Message, Conversation } from "./models/index.js";
import { verifyAccessToken } from "./utils/auth.js";

let ioInstance = null;
const onlineUsers = new Map(); // userId -> Set of socketIds

export function initSocket(httpServer, corsOrigins) {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Accept requests from any valid client origin
        callback(null, true);
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  ioInstance = io;

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "") ||
        socket.handshake.headers?.cookie
          ?.split(";")
          ?.find((c) => c.trim().startsWith("sc_token="))
          ?.split("=")[1];

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub).select("_id username name avatarUrl");
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error(`Authentication error: ${err.message}`));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id.toString();

    // Track online presence
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal user room
    socket.join(`user:${userId}`);

    // Broadcast online status to all connected users
    io.emit("user_status", { userId, status: "online" });
    socket.emit("online_users", Array.from(onlineUsers.keys()));

    // 1. Direct Messaging
    socket.on("send_message", async ({ recipientId, text, mediaUrl }, callback) => {
      try {
        if (!recipientId || (!text && !mediaUrl)) {
          return callback?.({ error: "Invalid message payload" });
        }

        // Find or create conversation
        let conversation = await Conversation.findOne({
          participants: { $all: [userId, recipientId] },
        });

        if (!conversation) {
          conversation = await Conversation.create({
            participants: [userId, recipientId],
          });
        }

        const msg = await Message.create({
          conversationId: conversation._id,
          sender: userId,
          recipient: recipientId,
          text: text || "",
          mediaUrl: mediaUrl || "",
          seen: false,
        });

        conversation.lastMessage = msg._id;
        await conversation.save();

        const populatedMsg = await Message.findById(msg._id)
          .populate("sender", "username name avatarUrl")
          .populate("recipient", "username name avatarUrl")
          .lean();

        // Send to recipient's room and sender's room
        io.to(`user:${recipientId}`).emit("new_message", populatedMsg);
        socket.emit("new_message", populatedMsg);

        callback?.({ success: true, message: populatedMsg });
      } catch (err) {
        callback?.({ error: err.message });
      }
    });

    // 2. Typing Indicators
    socket.on("typing", ({ recipientId }) => {
      io.to(`user:${recipientId}`).emit("typing", { userId, username: socket.user.username });
    });

    socket.on("stop_typing", ({ recipientId }) => {
      io.to(`user:${recipientId}`).emit("stop_typing", { userId });
    });

    // 3. Seen Receipt
    socket.on("mark_seen", async ({ conversationId, senderId }) => {
      try {
        await Message.updateMany(
          { conversationId, sender: senderId, recipient: userId, seen: false },
          { $set: { seen: true, seenAt: new Date() } },
        );
        io.to(`user:${senderId}`).emit("messages_seen", { conversationId, seenBy: userId });
      } catch (err) {
        console.error("[Socket] mark_seen error:", err);
      }
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      if (onlineUsers.has(userId)) {
        onlineUsers.get(userId).delete(socket.id);
        if (onlineUsers.get(userId).size === 0) {
          onlineUsers.delete(userId);
          io.emit("user_status", { userId, status: "offline" });
        }
      }
    });
  });

  return io;
}

export function getIO() {
  return ioInstance;
}

export function emitNotification(recipientId, notification) {
  if (ioInstance) {
    ioInstance.to(`user:${recipientId.toString()}`).emit("new_notification", notification);
  }
}
