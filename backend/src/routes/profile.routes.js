import express from "express";
import validateProfile from "../middleware/validateProfile.js";
import {
  getProfile,
  createProfile,
} from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/", getProfile);

router.post(
  "/",
  validateProfile,
  createProfile
);

export default router;