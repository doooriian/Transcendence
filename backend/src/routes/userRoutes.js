import express from "express";
import prisma from "../prismaClient.js";
import authToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:username", authToken, async (req, res) => {
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
