import express from "express";
import healthRoutes from "./routes/healthRoutes.js";

const app = express();
const PORT = process.env.BACKEND_PORT || 1414;

// Middleware
app.use(express.json());
app.use("/health", healthRoutes);

app.listen(PORT, () => {
  console.log(`Backend has started on port: ${PORT}`);
});
