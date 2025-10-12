const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { GridFSBucket } = require("mongodb");
const fetch = require("node-fetch"); // <-- NEW: Required for making API calls

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

// --- API Key Configuration ---
// Retrieve the API key securely from the environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; 
// --- End Config ---

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);

// =========================================================================
// NEW: CHATBOT PROXY ROUTE INTEGRATION
// This route now handles the secure connection to OpenRouter.
// =========================================================================
app.post("/api/chatbot", async (req, res) => {
    // 1. Check for API Key configuration
    if (!OPENROUTER_API_KEY) {
        console.error('SERVER ERROR: OPENROUTER_API_KEY environment variable is not set!');
        return res.status(500).json({ error: 'Server configuration error: API key missing.' });
    }

    // 2. Extract parameters passed from the frontend (chatbot.jsx)
    const { user_prompt, model, referer, title } = req.body;

    if (!user_prompt) {
        return res.status(400).json({ error: 'Missing user_prompt in request body.' });
    }

    // 3. Construct the payload required by the OpenRouter API
    const openRouterPayload = {
        model: model || "openai/gpt-oss-20b:free", 
        messages: [
            { "role": "system", "content": "You are a helpful assistant for a blogging website. Answer user queries concisely." },
            { "role": "user", "content": user_prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
    };

    try {
        // 4. Make the external, secure request to OpenRouter
        const response = await fetch("https://api.openrouter.ai/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // API key is securely accessed from the server's environment
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`, 
                // Pass required OpenRouter usage headers
                'HTTP-Referer': referer, 
                'X-Title': title
            },
            body: JSON.stringify(openRouterPayload)
        });

        if (response.ok) {
            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content;
            
            if (reply) {
                // 5. Send the successful reply back to the frontend
                res.status(200).json({ reply: reply });
            } else {
                console.error('OpenRouter response error: Invalid structure or empty content.');
                res.status(502).json({ error: 'OpenRouter returned an invalid response structure.' });
            }
        } else {
            // Forward OpenRouter errors back to the frontend
            const errorText = await response.text();
            console.error(`OpenRouter HTTP Error ${response.status}: ${errorText}`);
            res.status(response.status).json({ error: `AI Service Error (${response.status})` });
        }
    } catch (error) {
        console.error('Network or processing error:', error);
        res.status(500).json({ error: 'Internal proxy server error during API request.' });
    }
});
// =========================================================================
// END CHATBOT PROXY ROUTE
// =========================================================================


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
