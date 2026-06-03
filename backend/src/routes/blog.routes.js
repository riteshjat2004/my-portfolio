import express from "express";

import {
  getBlogs,
  createBlog,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getBlogs);

router.get(
  "/:slug",
  getBlogBySlug
);

router.post(
  "/",
  authMiddleware,
  createBlog
);

router.put(
  "/:id",
  authMiddleware,
  updateBlog
);

router.delete(
  "/:id",
  authMiddleware,
  deleteBlog
);

export default router;