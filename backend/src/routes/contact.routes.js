import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  createContact,
  getContacts,
  deleteContact
} from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/", authMiddleware, getContacts);

router.post("/", createContact);

router.delete("/:id", authMiddleware, deleteContact);

export default router;