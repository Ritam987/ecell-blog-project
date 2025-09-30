const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const crypto = require("crypto");
const path = require("path");

// MongoDB connection URI (ensure process.env.MONGO_URI is set)
const mongoURI = process.env.MONGO_URI;

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      // Only allow image files
      if (!file.mimetype.startsWith("image/")) {
        return reject(new Error("Only images are allowed"));
      }

      // Generate random filename
      crypto.randomBytes(16, (err, buf) => {
        if (err) return reject(err);
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads", // must match GridFSBucket name used in blogs.js
        };
        resolve(fileInfo);
      });
    });
  },
});

// Multer upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1,
  },
});

module.exports = upload;
