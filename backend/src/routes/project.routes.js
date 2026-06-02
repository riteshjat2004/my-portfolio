import express from "express";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getFeaturedProjects,
} from "../controllers/project.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getProjects);

router.get(
  "/featured",
  getFeaturedProjects
);

router.post(
  "/",
  authMiddleware,
  createProject
);


router.put(
  "/:id",
  authMiddleware,
  updateProject
);

router.delete(
  "/:id",
  authMiddleware,
  deleteProject
);



export default router;