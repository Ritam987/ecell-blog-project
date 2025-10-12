// routes/chatbot.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// POST /api/chatbot
router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Message is required" });
  }

  // Check for API Key
  if (!OPENROUTER_API_KEY) {
    return res.status(503).json({ error: "Service Unavailable: API key is not configured." });
  }

  try {
    // Send user message to OpenRouter GPT-OSS-20B
    const response = await axios.post(
      "https://api.openrouter.ai/v1/chat/completions",
      {
        // NOTE: The model name usually includes the provider on OpenRouter. 
        // A safer model name might be "openai/gpt-3.5-turbo", but we stick to the provided one.
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
          "Content-Type": "application/json"
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err.response?.data || err.message);
    res.status(500).json({ reply: "Sorry, something went wrong. Try again later." });
  }
});

module.exports = router;
