import express from "express";
import validateProfile from "../middleware/validateProfile.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getProfile,
  createProfile,
} from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/", getProfile);

router.post(
  "/",
  authMiddleware,
  validateProfile,
  createProfile
);

export default router;