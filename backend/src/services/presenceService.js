const connectedUsers = new Map();

function addUserSocket(authId, socketId) {
  const wasOffline = !connectedUsers.has(authId);

  if (wasOffline) {
    connectedUsers.set(authId, new Set());
  }

  connectedUsers.get(authId).add(socketId);

  return wasOffline;
}

function removeUserSocket(authId, socketId) {
  const userSockets = connectedUsers.get(authId);

  if (!userSockets) {
    return false;
  }

  userSockets.delete(socketId);

  if (userSockets.size === 0) {
    connectedUsers.delete(authId);
    return true;
  }

  return false;
}

function isUserOnline(authId) {
  return connectedUsers.has(authId);
}

export { addUserSocket, removeUserSocket, isUserOnline };
