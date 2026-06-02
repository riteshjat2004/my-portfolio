import express from "express";

import {
  getBlogs,
  createBlog,
} from "../controllers/blog.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getBlogs);

router.post(
  "/",
  authMiddleware,
  createBlog
);

export default router;