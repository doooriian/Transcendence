import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = 3000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());
app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log("Backend has started on port: 3000");
});
