import express from "express";
import prisma from "../prismaClient.js";
import authToken from "../middleware/authMiddleware.js";
import { validateUsername } from "../utils/authValidation.js";
import { isUserOnline } from "../services/presenceService.js";

const router = express.Router();

// All friend routes require a valid authentication token
router.use(authToken);

/**
 * Returns the authenticated user's friends.
 *
 * GET /api/friends
 *
 * Response:
 * {
 *   friends: [
 *     { authId: "...", username: "John", isOnline: true }
 *   ]
 * }
 */
router.get("/", async (req, res) => {
  try {
    const friendList = await prisma.user.findUnique({
      where: {
        authId: req.authId,
      },
      select: {
        friendships: {
          select: {
            friend: {
              select: {
                authId: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!friendList) {
      return res.status(401).json({ message: "Invalid session" });
    }

    const friends = friendList.friendships.map((friendship) => {
      return {
        authId: friendship.friend.authId,
        username: friendship.friend.username,
        isOnline: isUserOnline(friendship.friend.authId),
      };
    });

    res.json({ friends });
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

/**
 * Returns the authenticated user's received and sent friend requests.
 *
 * GET /api/friends/requests
 *
 * Response:
 * {
 *   received: [
 *     { id: 1, username: "John" }
 *   ],
 *   sent: [
 *     { id: 2, username: "Doe" }
 *   ]
 * }
 */
router.get("/requests", async (req, res) => {
  try {
    const requestList = await prisma.user.findUnique({
      where: {
        authId: req.authId,
      },
      select: {
        receivedFriendRequests: {
          select: {
            id: true,
            sender: {
              select: {
                username: true,
              },
            },
          },
        },
        sentFriendRequests: {
          select: {
            id: true,
            receiver: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });

    if (!requestList) {
      return res.status(401).json({
        message: "Invalid session",
      });
    }

    const received = requestList.receivedFriendRequests.map((request) => {
      return {
        id: request.id,
        username: request.sender.username,
      };
    });

    const sent = requestList.sentFriendRequests.map((request) => {
      return {
        id: request.id,
        username: request.receiver.username,
      };
    });

    return res.json({
      received,
      sent,
    });
  } catch (err) {
    console.error(err.message);
    return res.sendStatus(500);
  }
});

/**
 * Sends a friend request to another user.
 *
 * POST /api/friends/requests
 *
 * Body:
 * {
 *   username: "John"
 * }
 *
 * Returns 201 when the request is successfully created.
 */
router.post("/requests", async (req, res) => {
  try {
    const usernameValidation = validateUsername(req.body?.username);

    if (usernameValidation.error) {
      return res.status(400).json({
        message: usernameValidation.error,
      });
    }

    const username = usernameValidation.username;

    const sender = await prisma.user.findUnique({
      where: {
        authId: req.authId,
      },
      select: {
        id: true,
      },
    });

    if (!sender) {
      return res.status(401).json({
        message: "Invalid session",
      });
    }

    const receiver = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        authId: true,
      },
    });

    if (!receiver) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (sender.id === receiver.id)
      return res.status(400).json({ message: "Self request not allowed" });

    const friendship = await prisma.friendship.findUnique({
      where: {
        userId_friendId: {
          userId: sender.id,
          friendId: receiver.id,
        },
      },
    });

    if (friendship) {
      return res.status(409).json({
        message: "Users are already friends",
      });
    }

    const pairKey =
      Math.min(sender.id, receiver.id) + ":" + Math.max(sender.id, receiver.id);

    await prisma.friendRequest.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        pairKey,
      },
    });

    const io = req.app.get("io");

    io.to(`user:${req.authId}`)
      .to(`user:${receiver.authId}`)
      .emit("friends:changed");

    res.status(201).json({ message: "Friend request sent" });
  } catch (err) {
    console.error(err.message);

    // Prisma P2002: unique constraint violation (friend request already exists).
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Friend request already exists" });
    }

    res.sendStatus(500);
  }
});

/**
 * Accepts a received friend request.
 *
 * POST /api/friends/requests/:id/accept
 *
 * `id` is the FriendRequest id returned by GET /api/friends/requests.
 *
 * Returns 200 when the friendship is successfully created.
 */
router.post("/requests/:id/accept", async (req, res) => {
  try {
    const requestId = Number(req.params.id);

    if (!Number.isInteger(requestId)) {
      return res.status(400).json({
        message: "Invalid friend request id",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        authId: req.authId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid session",
      });
    }

    const friendRequest = await prisma.friendRequest.findUnique({
      where: {
        id: requestId,
      },
      select: {
        senderId: true,
        receiverId: true,
        sender: {
          select: {
            authId: true,
          },
        },
      },
    });

    if (!friendRequest) {
      return res.status(404).json({
        message: "Friend request not found",
      });
    }

    if (friendRequest.receiverId !== user.id) {
      return res.status(403).json({
        message: "You cannot accept this friend request",
      });
    }

    await prisma.$transaction([
      prisma.friendship.create({
        data: {
          userId: friendRequest.senderId,
          friendId: friendRequest.receiverId,
        },
      }),

      prisma.friendship.create({
        data: {
          userId: friendRequest.receiverId,
          friendId: friendRequest.senderId,
        },
      }),

      prisma.friendRequest.delete({
        where: {
          id: requestId,
        },
      }),
    ]);

    const io = req.app.get("io");

    io.to(`user:${req.authId}`)
      .to(`user:${friendRequest.sender.authId}`)
      .emit("friends:changed");

    return res.status(200).json({
      message: "Friend request accepted",
    });
  } catch (err) {
    console.error(err.message);

    if (err.code === "P2002") {
      return res.status(409).json({
        message: "Users are already friends",
      });
    }

    return res.sendStatus(500);
  }
});

/**
 * Deletes a friend request.
 *
 * DELETE /api/friends/requests/:id
 *
 * The receiver can use this route to reject a request.
 * The sender can use it to cancel a sent request.
 *
 * `id` is the FriendRequest id returned by GET /api/friends/requests.
 */
router.delete("/requests/:id", async (req, res) => {
  try {
    const requestId = Number(req.params.id);

    if (!Number.isInteger(requestId)) {
      return res.status(400).json({
        message: "Invalid friend request id",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        authId: req.authId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid session",
      });
    }

    const friendRequest = await prisma.friendRequest.findUnique({
      where: {
        id: requestId,
      },
      select: {
        senderId: true,
        receiverId: true,
        sender: {
          select: {
            authId: true,
          },
        },
        receiver: {
          select: {
            authId: true,
          },
        },
      },
    });

    if (!friendRequest) {
      return res.status(404).json({
        message: "Friend request not found",
      });
    }

    if (
      friendRequest.senderId !== user.id &&
      friendRequest.receiverId !== user.id
    ) {
      return res.status(403).json({
        message: "You cannot delete this friend request",
      });
    }

    await prisma.friendRequest.delete({
      where: {
        id: requestId,
      },
    });

    const io = req.app.get("io");

    io.to(`user:${friendRequest.sender.authId}`)
      .to(`user:${friendRequest.receiver.authId}`)
      .emit("friends:changed");

    return res.status(200).json({
      message: "Friend request deleted",
    });
  } catch (err) {
    console.error(err.message);
    return res.sendStatus(500);
  }
});

/**
 * Removes a user from the authenticated user's friend list.
 *
 * DELETE /api/friends/users/:username
 *
 * Example:
 * DELETE /api/friends/users/John
 *
 * Returns 200 when the friendship is successfully removed.
 */
router.delete("/users/:username", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        authId: req.authId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid session",
      });
    }

    const friend = await prisma.user.findUnique({
      where: {
        username: req.params.username,
      },
      select: {
        id: true,
        authId: true,
      },
    });

    if (!friend) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const result = await prisma.friendship.deleteMany({
      where: {
        OR: [
          {
            userId: user.id,
            friendId: friend.id,
          },
          {
            userId: friend.id,
            friendId: user.id,
          },
        ],
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        message: "Friendship not found",
      });
    }

    const io = req.app.get("io");

    io.to(`user:${req.authId}`)
      .to(`user:${friend.authId}`)
      .emit("friends:changed");

    return res.status(200).json({
      message: "Friend removed",
    });
  } catch (err) {
    console.error(err.message);
    return res.sendStatus(500);
  }
});

export default router;
