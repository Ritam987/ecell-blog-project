const express = require("express");
const axios = require("axios");
const router = express.Router();

// --- Environment Variables Setup ---
// These variables must be set on the Render dashboard for security and functionality.
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
// Defaults are provided for required OpenRouter headers if environment variables are missing
const OPENROUTER_REFERER = process.env.OPENROUTER_REFERER || "http://localhost:3000"; 
const OPENROUTER_TITLE = process.env.OPENROUTER_TITLE || "Ecell Blog Project Chatbot"; 

// POST /api/chatbot
router.post("/", async (req, res) => {
  const { message } = req.body;

  // 1. Input Validation
  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Message is required" });
  }

  // 2. Critical Configuration Check
  if (!OPENROUTER_API_KEY) {
    console.error("CRITICAL ERROR: OPENROUTER_API_KEY is not set.");
    // Use 'error' field for immediate failure to align with frontend error handling
    return res.status(503).json({ error: "Service Unavailable: API key is not configured." });
  }

  try {
    // 3. Send message to OpenRouter
    const response = await axios.post(
      "https://api.openrouter.ai/v1/chat/completions",
      {
        model: "gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant for a blogging website. Answer user queries clearly and politely."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          // OpenRouter recommended headers:
          "HTTP-Referer": OPENROUTER_REFERER,
          "X-Title": OPENROUTER_TITLE
        },
        timeout: 15000 // 15 second timeout for external API call
      }
    );

    // 4. Extract and Validate Reply
    const reply = response.data?.choices?.[0]?.message?.content;

    if (!reply) {
        console.error("OpenRouter returned a valid status but no reply content:", response.data);
        return res.status(500).json({ reply: "Received an empty or malformed reply from the AI service." });
    }
    
    // Success response
    res.json({ reply });

  } catch (err) {
    // 5. Advanced Error Handling
    if (err.response) {
      // Error from OpenRouter (e.g., 401, 429, 500 status code from the external API)
      const status = err.response.status;
      const data = err.response.data;
      
      console.error(`OpenRouter API Error (${status}):`, JSON.stringify(data));
      
      // Attempt to return a detailed error message from OpenRouter
      const errorMessage = data.error?.message || `AI service responded with status ${status}.`;
      
      // Return 502 (Bad Gateway) since the failure came from an external service
      // The frontend is now configured to read the 'reply' or 'error' field on failure
      return res.status(502).json({ error: `AI Error: ${errorMessage}. Try again later.` });
    }
    
    // Handle network errors (timeout, connection refused, etc.)
    console.error("General Chatbot Error (Network/Internal):", err.message);
    res.status(500).json({ error: "Sorry, a server error occurred. Please check the backend console." });
  }
});

module.exports = router;
