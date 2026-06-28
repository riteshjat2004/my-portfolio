import express from "express";
import validateProfile from "../middleware/validateProfile.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { uploadResume } from "../middleware/upload.middleware.js";
import {
  getProfile,
  createProfile,
  getResume,
  updateResume,
} from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/", getProfile);
router.get("/resume", getResume);

router.post(
  "/",
  authMiddleware,
  validateProfile,
  createProfile
);

router.put(
    "/resume",
    authMiddleware,
    uploadResume,
    updateResume
);

export default router;