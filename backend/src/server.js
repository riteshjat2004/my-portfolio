import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.routes.js";

import profileRoutes from "./routes/profile.routes.js";

import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

app.use(cors());

app.use("/api/profile", profileRoutes);

app.use("/api/health", healthRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Portfolio API Running",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});