import express from "express";

import {
  getStats,
  trackVisitor,
  trackResumeDownload,
  trackProjectClick,
  getTopPages,
  getTopProjects,
} from "../controllers/analytics.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";


const router = express.Router();

router.get("/stats", authMiddleware, getStats);

router.get("/top-pages", authMiddleware,   getTopPages);

router.get("/top-projects", authMiddleware, getTopProjects);

router.post("/visit", trackVisitor);

router.post("/resume-download", trackResumeDownload);

router.post("/project-click", trackProjectClick);

export default router;