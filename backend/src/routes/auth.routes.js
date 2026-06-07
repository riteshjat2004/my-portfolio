import express from "express";
import { loginLimiter } from "../middleware/rateLimit.middleware.js";

import {
  register,
  login,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);

router.post("/login",loginLimiter, login);

export default router;