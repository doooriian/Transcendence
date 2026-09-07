import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";

import authSocket from "./middleware/socketAuthMiddleware.js";

const app = express();

// Create the HTTP server used by both Express and Socket.IO
const httpServer = createServer(app);

// Attach Socket.IO to the existing HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const PORT = 3000;

// Allow HTTP requests from the frontend application
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

// Authenticate Socket.IO clients before accepting their connection
io.use(authSocket);

// Handle authenticated Socket.IO client connections
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  console.log(`Authenticated user: ${socket.data.authId}`);

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Start the shared HTTP server
httpServer.listen(PORT, () => {
  console.log(`Backend has started on port: ${PORT}`);
});
