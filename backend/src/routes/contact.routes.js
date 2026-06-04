import express from "express";

import {
  createContact,
  getContacts,
  deleteContact
} from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/", getContacts);

router.post("/", createContact);

router.delete("/:id", deleteContact);

export default router;