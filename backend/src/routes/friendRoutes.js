import express from "express";
import prisma from "../prismaClient.js";
import authToken from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authToken);

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
                username: true,
              },
            },
          },
        },
      },
    });

    if (!friendList) {
      return res.status(404).json({ message: "User not found" });
    }

    const friends = friendList.friendships.map((friendship) => {
      return friendship.friend;
    });

    res.json({ friends });
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

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
      return res.status(404).json({
        message: "User not found",
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

router.post("/requests", async (req, res) => {
  try {
    const username = req.body?.username;

    if (typeof username !== "string") {
      return res.status(400).json({
        message: "Username is required",
      });
    }

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

    return res.status(200).json({
      message: "Friend request deleted",
    });
  } catch (err) {
    console.error(err.message);
    return res.sendStatus(500);
  }
});

router.delete("/:username", async (req, res) => {
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

    return res.status(200).json({
      message: "Friend removed",
    });
  } catch (err) {
    console.error(err.message);
    return res.sendStatus(500);
  }
});

export default router;
