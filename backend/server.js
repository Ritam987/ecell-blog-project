const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { GridFSBucket } = require("mongodb");

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: "*" })); // allow public access
app.use(express.json());

// Serve uploads statically (legacy)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoutes = require("./routes/auth");
const blogRoutes = require("./routes/blogs");
const userRoutes = require("./routes/users");


app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);


// MongoDB connection
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");

    // GridFS bucket setup for blog images
    const db = mongoose.connection.db;
    const bucketName = "blogImages";
    app.locals.gfsBucket = new GridFSBucket(db, { bucketName });
    console.log(`GridFS bucket "${bucketName}" initialized`);
  })
  .catch((err) => console.error("MongoDB connection error:", err));



// Serve React static files
app.use(express.static(path.join(__dirname, "frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});


// Default route
app.get("/", (req, res) => res.send("E-Cell Blogging Backend is running!"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


