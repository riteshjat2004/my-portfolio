import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.routes.js";

import profileRoutes from "./routes/profile.routes.js";

import contactRoutes from "./routes/contact.routes.js";

import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";

import adminRoutes from "./routes/admin.routes.js";

import projectRoutes from "./routes/project.routes.js";

import blogRoutes from "./routes/blog.routes.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://my-portfolio-two-theta-51.vercel.app",
    ],
    credentials: true,
  })
);

app.use("/api/contact", contactRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/health", healthRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/projects", projectRoutes);


app.use("/api/blogs", blogRoutes);

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