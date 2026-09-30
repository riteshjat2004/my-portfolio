import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/errorHandler.js";

// Timing-safe secret comparison to mitigate side-channel timing attacks
const isSecretValid = (providedSecret, actualSecret) => {
  if (!providedSecret || !actualSecret) return false;
  const provBuf = Buffer.from(String(providedSecret));
  const actBuf = Buffer.from(String(actualSecret));
  if (provBuf.length !== actBuf.length) return false;
  return crypto.timingSafeEqual(provBuf, actBuf);
};

export const register = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (!isSecretValid(adminSecret, process.env.ADMIN_SECRET)) {
      return res.status(403).json({
        success: false,
        message: "Invalid admin secret",
      });
    }

    // Restrict registration if an admin account already exists
    const existingUserCount = await User.countDocuments();
    if (existingUserCount > 0 && process.env.ALLOW_REGISTRATION !== "true") {
      return res.status(403).json({
        success: false,
        message: "Registration is closed. An admin account already exists.",
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    sendError(res, error, "Registration failed");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    };

    // Only set ownerToken for the portfolio owner
    const isOwner =
      process.env.OWNER_EMAIL &&
      user.email === process.env.OWNER_EMAIL.toLowerCase().trim();

    if (isOwner && process.env.OWNER_SECRET) {
      res.cookie("ownerToken", process.env.OWNER_SECRET, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
    } else {
      res.clearCookie("ownerToken", cookieOptions);
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    sendError(res, error, "Login failed");
  }
};

export const logout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    res.clearCookie("ownerToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    sendError(res, error, "Logout failed");
  }
};