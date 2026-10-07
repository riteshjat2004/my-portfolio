import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import healthRoutes from "./routes/health.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import projectRoutes from "./routes/project.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import devvaultRoutes from "./routes/devvault.routes.js";
import devVaultPublishDiagnostics from "./middleware/devvaultPublishDiagnostics.js";

connectDB();

const app = express();

app.set("trust proxy", 1);

app.use(devVaultPublishDiagnostics);

// Configure dynamic CORS origins
const defaultAllowedOrigins = [
  "http://localhost:3000",
  "https://my-portfolio-two-theta-51.vercel.app",
];

const envAllowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [];

if (process.env.CLIENT_URL) {
  envAllowedOrigins.push(process.env.CLIENT_URL.trim());
}

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowedOrigins]));

// Apply security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        frameAncestors: [
          "'self'",
          ...allowedOrigins,
        ],
      },
    },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS error: Origin ${origin} is not allowed`), false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// API Routes
app.use("/api/analytics", analyticsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/devvault", devvaultRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Portfolio API Running",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Centralized unhandled error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const isProd = process.env.NODE_ENV === "production";
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: isProd ? "An internal server error occurred." : (err.message || "An internal server error occurred."),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});