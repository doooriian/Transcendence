import express from "express";

const router = express.Router();

/**
 * Checks whether the backend service is running.
 */
router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "backend",
  });
});

export default router;
