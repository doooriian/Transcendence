import express from "express";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";
import authToken from "../middleware/authMiddleware.js";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../utils/authValidation.js";

const router = express.Router();

/**
 * Registers a new user.
 *
 * Validates the provided credentials, hashes the password,
 * stores the user in the database and returns a JWT.
 */
router.post("/register", async (req, res) => {
  const validation = validateRegisterInput(
    req.body?.username,
    req.body?.email,
    req.body?.password,
  );

  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  const { username, email, password } = validation;

  try {
    const hashedPassword = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
      },
    });

    const token = jwt.sign({ sub: user.authId }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({ token, username: user.username });
  } catch (err) {
    // Prisma P2002: unique constraint violation (Email or username already exists).
    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Email or username already exists" });
    }

    console.error(err.message);
    res.sendStatus(500);
  }
});

/**
 * Authenticates an existing user.
 *
 * Verifies the username and password and returns a JWT
 * when the credentials are valid.
 */
router.post("/login", async (req, res) => {
  const validation = validateLoginInput(req.body?.email, req.body?.password);

  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  const { email, password } = validation;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordIsValid = await argon2.verify(user.passwordHash, password);

    if (!passwordIsValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ sub: user.authId }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

/**
 * Returns the currently authenticated user's profile.
 *
 * The authentication middleware verifies the JWT and exposes
 * the user's authentication identifier through `req.authId`.
 */
router.get("/me", authToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        authId: req.authId,
      },
      select: {
        id: true,
        authId: true,
        email: true,
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
