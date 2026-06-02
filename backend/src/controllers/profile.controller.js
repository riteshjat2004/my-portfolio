import Profile from "../models/Profile.model.js";

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne();

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createProfile = async (req, res) => {
    console.log(req.body);
  try {
    const profile = await Profile.findOne();

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};