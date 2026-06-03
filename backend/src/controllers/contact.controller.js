import Contact from "../models/contact.model.js";

export const createContact = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);

    res.status(201).json({
      success: true,
      contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({
      createdAt: -1,
    });

    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};