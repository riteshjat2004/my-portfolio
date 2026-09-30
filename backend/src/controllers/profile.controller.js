import { Readable } from "stream";
import Profile from "../models/Profile.model.js";
import { uploadResumeToCloudinary } from "../services/cloudinary.service.js";
import { sendError } from "../utils/errorHandler.js";

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne();

    res.status(200).json(profile);
  } catch (error) {
    sendError(res, error, "Failed to retrieve profile");
  }
};

export const createProfile = async (req, res) => {
  try {
    const { name, role, college, cgpa, skills } = req.body;
    const updateData = {
      name: name?.trim(),
      role: role?.trim(),
      college: college?.trim() || "",
      ...(cgpa !== undefined ? { cgpa: Number(cgpa) } : {}),
      ...(Array.isArray(skills) ? { skills } : {}),
    };

    const profile = await Profile.findOneAndUpdate(
      {},
      { $set: updateData },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile,
    });
  } catch (error) {
    sendError(res, error, "Failed to process profile");
  }
};

export const getResume = async (req, res) => {
  try {
    const profile = await Profile.findOne();

    if (!profile || !profile.resumeUrl) {
      return res.status(404).json({
        message: "No resume uploaded yet.",
      });
    }

    const acceptsJson = req.headers.accept?.includes("application/json");

    if (acceptsJson) {
      return res.status(200).json({
        message: "Resume found.",
        resumeUrl: profile.resumeUrl,
        resumeFileName: profile.resumeFileName || "",
      });
    }

    const remoteResponse = await fetch(profile.resumeUrl, {
      headers: {
        Accept: "application/pdf, application/octet-stream, */*",
      },
    });

    if (!remoteResponse.ok || !remoteResponse.body) {
      return res.status(502).json({
        message: "Unable to load the resume preview.",
      });
    }

    const fallbackName = profile.resumeFileName || "resume.pdf";
    const contentType = "application/pdf";
    const wantsDownload = ["1", "true", "download", "attachment"].includes(
      String(req.query.download || "").toLowerCase()
    );
    const disposition = wantsDownload ? "attachment" : "inline";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `${disposition}; filename="${fallbackName}"`);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    return Readable.fromWeb(remoteResponse.body).pipe(res);
  } catch (error) {
    return sendError(res, error, "Failed to load resume preview");
  }
};

export const updateResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Resume file is required.",
            });
        }

        const result = await uploadResumeToCloudinary(req.file.buffer, req.file.originalname);

        let profile = await Profile.findOne();

        if (!profile) {
            profile = new Profile({
                name: "Developer",
                role: "Full Stack Developer",
                college: "N/A",
            });
        }

        profile.resumeUrl = result.secure_url;
        profile.resumeFileName = req.file.originalname || "resume.pdf";
        await profile.save();

        res.status(200).json({
            success: true,
            message: "Resume updated successfully.",
            resumeUrl: profile.resumeUrl,
            resumeFileName: profile.resumeFileName,
        });

    } catch (error) {
        sendError(res, error, "Failed to upload resume");
    }
};