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
// ⚠️ If you are NOT using chatbot yet, comment this out
// const chatbotRoutes = require("./routes/chatbot");

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/chatbot", chatbotRoutes);

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");

    const db = mongoose.connection.db;
    const bucketName = "blogImages";
    app.locals.gfsBucket = new GridFSBucket(db, { bucketName });
    console.log(`GridFS bucket "${bucketName}" initialized`);
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Serve frontend build (important fix 🚀)
app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// Default route (backend check)
app.get("/api", (req, res) => res.send("E-Cell Blogging Backend is running!"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
