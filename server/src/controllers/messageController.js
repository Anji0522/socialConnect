import { Conversation, Message, User } from "../models/index.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import { publicProfile } from "../utils/postMapper.js";

export const listConversations = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const conversations = await Conversation.find({ participants: userId })
    .populate("participants", "username name avatarUrl isPrivate")
    .populate("lastMessage")
    .sort({ updatedAt: -1 })
    .lean();

  const formatted = await Promise.all(
    conversations.map(async (c) => {
      const otherParticipant = c.participants.find((p) => p._id.toString() !== userId);
      const unreadCount = await Message.countDocuments({
        conversationId: c._id,
        recipient: userId,
        seen: false,
      });

      return {
        id: c._id.toString(),
        otherUser: otherParticipant
          ? {
              id: otherParticipant._id.toString(),
              username: otherParticipant.username,
              name: otherParticipant.name,
              avatarUrl: otherParticipant.avatarUrl,
            }
          : null,
        lastMessage: c.lastMessage
          ? {
              id: c.lastMessage._id.toString(),
              text: c.lastMessage.text,
              mediaUrl: c.lastMessage.mediaUrl,
              createdAt: c.lastMessage.createdAt,
              senderId: c.lastMessage.sender.toString(),
            }
          : null,
        unreadCount,
        updatedAt: c.updatedAt,
      };
    }),
  );

  res.json({ conversations: formatted });
});

export const getMessages = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { recipientId } = req.params;

  let conversation = await Conversation.findOne({
    participants: { $all: [userId, recipientId] },
  });

  if (!conversation) {
    return res.json({ messages: [], conversationId: null });
  }

  // Mark messages from other user as seen
  await Message.updateMany(
    { conversationId: conversation._id, recipient: userId, seen: false },
    { $set: { seen: true, seenAt: new Date() } },
  );

  const messages = await Message.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .populate("sender", "username name avatarUrl")
    .populate("recipient", "username name avatarUrl")
    .lean();

  res.json({
    conversationId: conversation._id.toString(),
    messages: messages.map((m) => ({
      id: m._id.toString(),
      senderId: m.sender._id.toString(),
      sender: {
        id: m.sender._id.toString(),
        username: m.sender.username,
        name: m.sender.name,
        avatarUrl: m.sender.avatarUrl,
      },
      text: m.text,
      mediaUrl: m.mediaUrl,
      seen: m.seen,
      seenAt: m.seenAt,
      createdAt: m.createdAt,
    })),
  });
});

export const sendMessageRest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { recipientId, text, mediaUrl } = req.body;

  if (!recipientId || (!text && !mediaUrl)) {
    throw new AppError(400, "Recipient and content are required");
  }

  // Check if sender is blocked by recipient or vice versa
  const recipient = await User.findById(recipientId);
  if (!recipient) throw new AppError(404, "User not found");

  if (recipient.blockedUsers?.includes(userId) || req.user.blockedUsers?.includes(recipientId)) {
    throw new AppError(403, "Cannot send message to this user");
  }

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

  res.status(201).json({
    message: {
      id: msg._id.toString(),
      senderId: userId,
      text: msg.text,
      mediaUrl: msg.mediaUrl,
      seen: false,
      createdAt: msg.createdAt,
    },
  });
});
