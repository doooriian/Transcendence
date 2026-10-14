const MESSAGE_MAX_LENGTH = 500;

/**
 * Validates and normalizes a chat message payload.
 */
function validateChatMessage(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { error: "Invalid message data" };
  }

  if (typeof data.to !== "string" || data.to.trim().length === 0) {
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
    to: data.to.trim(),
    content,
  };
}

/**
 * Handles an incoming chat message and reports validation errors
 * to the requesting socket.
 */
function handleChatSend(socket, data) {
  const messageData = validateChatMessage(data);

  if (messageData.error) {
    socket.emit("chat:error", { message: messageData.error });
    return;
  }

  console.log("Valid chat message:", messageData);
}

/**
 * Registers chat-related Socket.IO events for an authenticated socket.
 */
function registerChatHandlers(socket) {
  socket.on("chat:send", (data) => handleChatSend(socket, data));
}

export default registerChatHandlers;
