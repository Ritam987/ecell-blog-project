const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { GridFSBucket } = require("mongodb");
// Removed: const fetch = require("node-fetch"); 
// The fetch dependency is now only needed inside routes/chatbot.ts

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

// --- CHATBOT INTEGRATION ---
// 1. Import the external Chatbot Router.
// Note: We use require("./routes/chatbot") which will correctly load the .ts file
// if your setup uses ts-node or a compilation step.
const chatbotRoutes = require("../routes/chatbot"); 
// --- END CHATBOT INTEGRATION ---

// Removed: All code related to OPENROUTER_API_KEY configuration and the huge 
// app.post("/api/chatbot", ...) block is gone, as it is now securely contained in chatbot.ts.

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);

// 2. Mount the Chatbot Router to the designated API path.
app.use("/api/chatbot", chatbotRoutes);

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

// Default route
app.get("/", (req, res) => res.send("E-Cell Blogging Backend is running!"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

