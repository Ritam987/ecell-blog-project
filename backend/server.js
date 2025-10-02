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

// MongoDB connection
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");

    // GridFS bucket setup
    const db = mongoose.connection.db;
    const bucketName = "blogImages"; // your bucket name
    app.locals.gfsBucket = new GridFSBucket(db, { bucketName });

    console.log(`GridFS bucket "${bucketName}" initialized`);
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// API routes
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blogs");
const userRoutes = require("./routes/users");
// const chatbotRoutes = require("./routes/chatbot"); // if using chatbot
// app.use("/api/chatbot", chatbotRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);

// Serve React build
app.use(express.static(path.join(__dirname, "./frontend")));

// Catch-all route to handle React Router refresh (must be AFTER API routes)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./frontend", "index.html"));
});

// Default route
app.get("/api", (req, res) => res.send("E-Cell Blogging Backend is running!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

