import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const uploadResumeToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "portfolio/resume",
                resource_type: "raw",
                use_filename: true,
                unique_filename: false,
                overwrite: true,
                invalidate: true,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};
export const uploadImageToCloudinary = (fileBuffer, folder = "portfolio/devvault") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

// Service initialized without leaking credentials
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    console.log("Cloudinary service initialized successfully");
} else {
    console.warn("Cloudinary configuration is incomplete. Some features may not work.");
}