import jwt from "jsonwebtoken";

/**
 * Authenticates a Socket.IO connection using the JWT sent
 * in the Socket.IO handshake.
 *
 * Expects the token in:
 * socket.handshake.auth.token
 *
 * If the token is valid, its `sub` claim is stored in
 * `socket.data.authId` so Socket.IO event handlers can
 * identify the authenticated user.
 *
 * If the token is missing, invalid, or expired, the
 * Socket.IO connection is rejected.
 */
function authSocket(socket, next) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication token is required"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof payload !== "object" || typeof payload.sub !== "string") {
      return next(new Error("Invalid token"));
    }

    socket.data.authId = payload.sub;

    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
}

export default authSocket;
