import express from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";
import authToken from "../middleware/authMiddleware.js";
import validateAuthInput from "../utils/authValidation.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const validation = validateAuthInput(req.body.username, req.body.password);

  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  const { username, password } = validation;

  try {
    const hashedPassword = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
      },
    });

    const token = jwt.sign({ sub: user.authId }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);

    if (err.code === "P2002") {
      return res.status(409).json({ message: "Username already exists" });
    }

    res.sendStatus(500);
  }
});

router.post("/login", async (req, res) => {
  const validation = validateAuthInput(req.body.username, req.body.password);

  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  const { username, password } = validation;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const passwordIsValid = await argon2.verify(user.passwordHash, password);

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ sub: user.authId }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

router.get("/me", authToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        authId: req.authId,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid session" });
    }

    res.json({ user });
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

export default router;
