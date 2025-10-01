const express = require("express");
const router = express.Router();
const axios = require("axios");

// Public Chatbot endpoint (no authentication required)
router.post("/public", async (req, res) => {
  const { message } = req.body;
  if (!message || message.trim() === "") {
    return res.status(400).json({ message: "Message is required" });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    console.error("OpenAI API key not found in environment variables");
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 600,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000, // 15 seconds
      }
    );

    const answer = response.data.choices[0].message.content;
    res.status(200).json({ answer });
  } catch (err) {
    console.error("Chatbot error:", err.message || err);
    if (err.response) {
      console.error("OpenAI response error:", err.response.data);
    }
    res.status(500).json({ message: "Server error. Check backend logs." });
  }
});

module.exports = router;
