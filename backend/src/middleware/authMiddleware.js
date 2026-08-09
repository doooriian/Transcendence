import jwt from "jsonwebtoken";

/**
 * Verifies the JWT sent in the Authorization header.
 *
 * Expects the following format:
 * Authorization: Bearer <token>
 *
 * If the token is valid, its `sub` claim is stored in `req.authId`
 * so protected routes can identify the authenticated user.
 *
 * This middleware only validates the token and does not query the database.
 */
function authToken(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res
      .status(401)
      .json({ message: "Authentication token is required" });
  }

  const [type, token] = authorizationHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      message: "Invalid authorization format",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (typeof payload !== "object" || typeof payload.sub !== "string") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    req.authId = payload.sub;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

export default authToken;
