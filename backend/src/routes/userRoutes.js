import express from "express";
import prisma from "../prismaClient.js";
import authToken from "../middleware/authMiddleware.js";

const SEARCH_MIN_LENGTH = 2;
const SEARCH_RESULT_LIMIT = 3;

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

  if (username.length < SEARCH_MIN_LENGTH) {
    return res.status(400).json({
      message: `Username query must contain at least ${SEARCH_MIN_LENGTH} characters`,
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
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: req.params.username,
      },
      select: {
        id: true,
        username: true,
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

export default router;
