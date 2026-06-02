import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  authMiddleware,
  (req, res) => {
    res.status(200).json({
      message: "Admin Access Granted",
      user: req.user,
    });
  }
);

export default router;