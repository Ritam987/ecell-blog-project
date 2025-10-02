const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { GridFSBucket } = require("mongodb");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes

const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blogs");
const userRoutes = require("./routes/users");


app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB connected");

    // GridFS bucket setup
    const db = mongoose.connection.db;
    const bucketName = "blogImages"; // bucket name
    app.locals.gfsBucket = new GridFSBucket(db, { bucketName });

    console.log(`✅ GridFS bucket "${bucketName}" initialized`);
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Default API check route
app.get("/api", (req, res) => res.send("E-Cell Blogging Backend is running!"));

// ✅ Serve React frontend build
app.use(express.static(path.join(__dirname, "build")));

// ✅ Fix for React Router refresh: always return index.html for unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

