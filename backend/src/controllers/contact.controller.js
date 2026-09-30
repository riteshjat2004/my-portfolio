import Contact from "../models/contact.model.js";
import Analytics from "../models/Analytics.model.js";
import { saveToTrash } from "../utils/trash.js";
import { sendError } from "../utils/errorHandler.js";

export const createContact = async (req, res) => {
  try {
    // Honeypot trap: if bot filled hidden field, return silent success
    if (req.body._hp || req.body._gotcha) {
      return res.status(201).json({
        success: true,
        message: "Message sent successfully!",
      });
    }

    const { name, email, message } = req.body;

    // Validate name
    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters.",
      });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email.trim()) || email.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Validate message
    if (!message || typeof message !== "string" || message.trim().length < 10 || message.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message must be between 10 and 5000 characters.",
      });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    // Update contact submission analytics atomically
    await Analytics.findOneAndUpdate(
      {},
      { $inc: { contactSubmissions: 1 } },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      contact,
    });
  } catch (error) {
    sendError(res, error, "Failed to submit contact message");
  }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      contacts,
    });

  } catch (error) {
    sendError(res, error, "Failed to retrieve contacts");
  }
};

export const deleteContact = async (
  req,
  res
) => {
  try {

    const contact =
      await Contact.findById(
        req.params.id
      );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    await saveToTrash(
      "contact",
      "delete",
      contact._id,
      contact.toObject()
    );

    await Contact.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        "Contact deleted successfully",
    });
  } catch (error) {
    sendError(res, error, "Failed to delete contact");
  }
};