import prisma from "../prismaClient.js";
import { isUserOnline } from "../services/presenceService.js";

const MESSAGE_MAX_LENGTH = 500;

/**
 * Validates and normalizes a chat message payload.
 */
function validateChatMessage(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { error: "Invalid message data" };
  }

  if (typeof data.toAuthId !== "string" || data.toAuthId.trim().length === 0) {
    return { error: "Invalid recipient" };
  }

  if (typeof data.content !== "string") {
    return { error: "Invalid message content" };
  }

  const content = data.content.trim();

  if (content.length === 0) {
    return { error: "Message cannot be empty" };
  }

  if (content.length > MESSAGE_MAX_LENGTH) {
    return { error: `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters` };
  }

  return {
    toAuthId: data.toAuthId.trim(),
    content,
  };
}

/**
 * Handles an incoming chat message and reports validation errors
 * to the requesting socket.
 */
async function handleChatSend(io, socket, data) {
  const messageData = validateChatMessage(data);

  if (messageData.error) {
    socket.emit("chat:error", { message: messageData.error });
    return;
  }

  try {
    const recipient = await prisma.user.findUnique({
      where: {
        authId: messageData.toAuthId,
      },
      select: {
        id: true,
        authId: true,
        username: true,
      },
    });

    if (!recipient) {
      socket.emit("chat:error", { message: "User not found" });
      return;
    }

    if (recipient.authId === socket.data.authId) {
      socket.emit("chat:error", { message: "You cannot message yourself" });
      return;
    }

    const sender = await prisma.user.findUnique({
      where: {
        authId: socket.data.authId,
      },
      select: {
        id: true,
        authId: true,
        username: true,
      },
    });

    if (!sender) {
      socket.emit("chat:error", { message: "Invalid session" });
      return;
    }

    const friendship = await prisma.friendship.findUnique({
      where: {
        userId_friendId: {
          userId: sender.id,
          friendId: recipient.id,
        },
      },
    });

    if (!friendship) {
      socket.emit("chat:error", {
        message: "You can only message your friends",
      });
      return;
    }

    if (!isUserOnline(recipient.authId)) {
      socket.emit("chat:error", { message: "User is offline" });
      return;
    }

    const message = {
      fromAuthId: sender.authId,
      from: sender.username,
      toAuthId: recipient.authId,
      to: recipient.username,
      content: messageData.content,
      sentAt: new Date().toISOString(),
    };

    io.to(`user:${recipient.authId}`).emit("chat:message", message);
    io.to(`user:${sender.authId}`).emit("chat:message", message);
  } catch (err) {
    console.error(err.message);
    socket.emit("chat:error", { message: "Unable to send message" });
  }
}

/**
 * Registers chat-related Socket.IO events for an authenticated socket.
 */
function registerChatHandlers(io, socket) {
  socket.on("chat:send", (data) => handleChatSend(io, socket, data));
}

export default registerChatHandlers;
