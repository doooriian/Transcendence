import express from "express";
import prisma from "../prismaClient.js";
import authToken from "../middleware/authMiddleware.js";
import {
  validateUsername,
  validateEmail,
  validateAvatar,
} from "../utils/authValidation.js";

const SEARCH_MIN_LENGTH = 2;
const SEARCH_RESULT_LIMIT = 3;
const SEARCH_MAX_LENGTH = 20;
const SEARCH_REGEX = /^[a-zA-Z0-9_]+$/;

const router = express.Router();

// All user routes require a valid authentication token
router.use(authToken);

/**
 * Returns username suggestions matching the provided search query.
 *
 * Searches usernames by prefix, ignoring case, and limits the number
 * of results returned. Authentication is required to use this route.
 */
router.get("/", async (req, res) => {
  const query = req.query.username;

  if (typeof query !== "string") {
    return res.status(400).json({
      message: "Username query is required",
    });
  }

  const username = query.trim();

  if (
    username.length < SEARCH_MIN_LENGTH ||
    username.length > SEARCH_MAX_LENGTH ||
    !SEARCH_REGEX.test(username)
  ) {
    return res.status(400).json({
      message: "Invalid username query",
    });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          startsWith: username,
          mode: "insensitive",
        },
      },
      select: {
        username: true,
      },
      orderBy: {
        username: "asc",
      },
      take: SEARCH_RESULT_LIMIT,
    });

    res.json({ users });
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

/**
 * Returns the public profile of a user identified by username.
 *
 * Authentication is required before accessing this route.
 */
router.get("/:username", async (req, res) => {
  const usernameValidation = validateUsername(req.params.username);

  if (usernameValidation.error) {
    return res.status(400).json({
      message: usernameValidation.error,
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: usernameValidation.username,
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

/**
 * Updates the authenticated user's profile information.
 *
 * Validates the provided fields before updating the user identified
 * by the authentication token.
 */
router.patch("/me", async (req, res) => {
  const data = {};

  if (req.body?.username !== undefined) {
    const usernameValidation = validateUsername(req.body.username);

    if (usernameValidation.error) {
      return res.status(400).json({ message: usernameValidation.error });
    }

    data.username = usernameValidation.username;
  }

  if (req.body?.email !== undefined) {
    const emailValidation = validateEmail(req.body.email);

    if (emailValidation.error) {
      return res.status(400).json({ message: emailValidation.error });
    }

    data.email = emailValidation.email;
  }

  if (req.body?.avatar !== undefined) {
    const avatarValidation = validateAvatar(req.body.avatar);

    if (avatarValidation.error) {
      return res.status(400).json({ message: avatarValidation.error });
    }

    data.avatar = avatarValidation.avatar;
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ message: "No profile fields provided" });
  }

  try {
    const user = await prisma.user.update({
      where: {
        authId: req.authId,
      },
      data,
      select: {
        username: true,
        email: true,
        avatar: true,
      },
    });

    if (data.username !== undefined) {
      const relations = await prisma.user.findUnique({
        where: {
          authId: req.authId,
        },
        select: {
          friendships: {
            select: {
              friend: {
                select: {
                  authId: true,
                },
              },
            },
          },
          sentFriendRequests: {
            select: {
              receiver: {
                select: {
                  authId: true,
                },
              },
            },
          },
          receivedFriendRequests: {
            select: {
              sender: {
                select: {
                  authId: true,
                },
              },
            },
          },
        },
      });

      if (relations) {
        const authIds = new Set([
          ...relations.friendships.map(
            (friendship) => friendship.friend.authId,
          ),
          ...relations.sentFriendRequests.map(
            (request) => request.receiver.authId,
          ),
          ...relations.receivedFriendRequests.map(
            (request) => request.sender.authId,
          ),
        ]);

        const io = req.app.get("io");

        for (const authId of authIds) {
          io.to(`user:${authId}`).emit("friends:changed");
        }
      }
    }

    return res.json({ user });
  } catch (err) {
    // Prisma P2002: unique constraint violation
    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Username or email already taken" });
    }

    // Prisma P2025: user to update was not found
    if (err.code === "P2025") {
      return res.status(401).json({ message: "Invalid session" });
    }

    console.error(err.message);
    res.sendStatus(500);
  }
});

export default router;
