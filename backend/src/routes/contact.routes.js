import express from "express";

import {
  createContact,
  getContacts,
} from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/", getContacts);

router.post("/", createContact);

export default router;