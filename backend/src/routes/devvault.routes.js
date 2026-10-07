import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { uploadDevVaultImageMiddleware } from "../middleware/upload.middleware.js";
import {
  getPublicHomeFeed,
  getPublicCategories,
  getPublicCategoryBySlug,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getPublicContent,
  getPublicContentBySlug,
  getAdminContentList,
  getAdminContentById,
  createContent,
  updateContent,
  deleteContent,
  patchContentStatus,
  uploadDevVaultImage,
  getPublicBrainTreasure,
  getPublicBrainTreasureById,
  getAdminBrainTreasureList,
  createBrainTreasure,
  updateBrainTreasure,
  deleteBrainTreasure,
  patchBrainTreasureStatus,
} from "../controllers/devvault.controller.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Consolidated Home Feed (Zero-delay single round-trip)
router.get("/home-feed", getPublicHomeFeed);

// Categories
router.get("/categories", getPublicCategories);
router.get("/categories/:slug", getPublicCategoryBySlug);

// Content
router.get("/content", getPublicContent);
router.get("/content/:slug", getPublicContentBySlug);

// Brain Treasure
router.get("/brain-treasure", getPublicBrainTreasure);
router.get("/brain-treasure/:id", getPublicBrainTreasureById);

// ==========================================
// ADMIN ROUTES (Protected with authMiddleware)
// ==========================================

// Admin Categories
router.get("/admin/categories", authMiddleware, getAdminCategories);
router.post("/admin/categories", authMiddleware, createCategory);
router.put("/admin/categories/:id", authMiddleware, updateCategory);
router.delete("/admin/categories/:id", authMiddleware, deleteCategory);

// Admin Content
router.get("/admin/content", authMiddleware, getAdminContentList);
router.get("/admin/content/:id", authMiddleware, getAdminContentById);
router.post("/admin/content", authMiddleware, createContent);
router.put("/admin/content/:id", authMiddleware, updateContent);
router.delete("/admin/content/:id", authMiddleware, deleteContent);
router.patch("/admin/content/:id/status", authMiddleware, patchContentStatus);

// Admin Brain Treasure
router.get("/admin/brain-treasure", authMiddleware, getAdminBrainTreasureList);
router.post("/admin/brain-treasure", authMiddleware, createBrainTreasure);
router.put("/admin/brain-treasure/:id", authMiddleware, updateBrainTreasure);
router.delete("/admin/brain-treasure/:id", authMiddleware, deleteBrainTreasure);
router.patch("/admin/brain-treasure/:id/status", authMiddleware, patchBrainTreasureStatus);

// Admin Image Upload (Cloudinary)
router.post(
  "/admin/upload-image",
  authMiddleware,
  uploadDevVaultImageMiddleware,
  uploadDevVaultImage
);

export default router;
