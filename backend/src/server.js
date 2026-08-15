import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";

const app = express();
const PORT = 3000;

// Allow requests from the frontend application
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
// Parse incoming JSON request bodies
app.use(express.json());

// API routes
app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);

// Start the HTTP server
app.listen(PORT, () => {
  console.log("Backend has started on port: 3000");
});
