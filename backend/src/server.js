import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";

const app = express();
const PORT = process.env.BACKEND_PORT || 3000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());
app.use("/health", healthRoutes);

app.listen(PORT, () => {
  console.log(`Backend has started on port: ${PORT}`);
});
