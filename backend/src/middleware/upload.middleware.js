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

export default upload;