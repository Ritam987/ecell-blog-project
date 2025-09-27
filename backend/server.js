const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const Grid = require("gridfs-stream");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("images"); // GridFS collection
  console.log("GridFS initialized");
});

// Setup GridFS storage for multer
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return {
      filename: "image_" + Date.now() + "_" + file.originalname,
      bucketName: "images", // collection name
    };
  },
});

const upload = multer({ storage });

// Route to serve images
app.get("/images/:filename", async (req, res) => {
  try {
    const file = await gfs.files.findOne({ filename: req.params.filename });
    if (!file) return res.status(404).json({ message: "Image not found" });

    const readstream = gfs.createReadStream(file.filename);
    res.set("Content-Type", file.contentType);
    readstream.pipe(res);
  } catch (err) {
    console.error("Get image error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Routes
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blogs");
const userRoutes = require("./routes/users");

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);

// Default route
app.get("/", (req, res) => res.send("E-Cell Blogging Backend is running!"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { upload }; // export multer upload for blog routes
