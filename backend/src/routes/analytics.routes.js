import express from "express";

import {
  getStats,
  trackVisitor,
  trackResumeDownload,
  trackProjectClick,
  getTopPages,
  getTopProjects,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/stats", getStats);

router.get("/top-pages", getTopPages);

router.get("/top-projects", getTopProjects);

router.post("/visit", trackVisitor);

router.post("/resume-download", trackResumeDownload);

router.post("/project-click", trackProjectClick);

export default router;