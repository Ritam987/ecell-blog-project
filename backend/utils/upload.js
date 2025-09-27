const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const crypto = require("crypto");
const path = require("path");
require("dotenv").config(); // Ensure .env variables are loaded

// MongoDB URI from .env
const mongoURI = process.env.MONGO_URI;

// Create GridFS storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useUnifiedTopology: true },
  file: (req, file) =>
    new Promise((resolve, reject) => {
      // Generate a random filename
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);

        const filename = buf.toString("hex") + path.extname(file.originalname);

        // File info: filename + bucketName in MongoDB
        const fileInfo = {
          filename: filename,
          bucketName: "uploads", // Collection in MongoDB GridFS
        };

        resolve(fileInfo);
      });
    }),
});

// File filter: allow both images and videos
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"), false);
  }
};

// Multer middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
    files: 1, // Only 1 file per request
  },
});

module.exports = upload;
