import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { contactLimiter } from "../middleware/rateLimit.middleware.js";

import {
  createContact,
  getContacts,
  deleteContact
} from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getContacts);

router.post("/", contactLimiter, createContact);

router.delete("/:id", authMiddleware, deleteContact);

export default router;