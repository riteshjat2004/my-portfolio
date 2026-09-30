import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed."));
        }
    },
});

export const uploadResume = (req, res, next) => {
    upload.single("resume")(req, res, (error) => {
        if (error) {
            if (error.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({
                    message: "Resume file must be smaller than 5MB.",
                });
            }

            if (error.code === "LIMIT_UNEXPECTED_FILE") {
                return res.status(400).json({
                    message: "Only one resume file can be uploaded at a time.",
                });
            }

            return res.status(400).json({
                message: error.message || "Invalid resume upload.",
            });
        }

        next();
    });
};

const imageUpload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/svg+xml",
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed."));
        }
    },
});

export const uploadDevVaultImageMiddleware = (req, res, next) => {
    imageUpload.single("image")(req, res, (error) => {
        if (error) {
            if (error.code === "LIMIT_FILE_SIZE") {
                return res.status(413).json({
                    message: "Image file must be smaller than 10MB.",
                });
            }
            return res.status(400).json({
                message: error.message || "Invalid image upload.",
            });
        }
        next();
    });
};

export default upload;