const express = require("express");
const router = express.Router();
const axios = require("axios");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Public AI Chatbot endpoint (no auth)
router.post("/public", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const answer = response.data.choices[0].message.content;
    res.status(200).json({ answer });
  } catch (err) {
    console.error("Chatbot error:", err.message || err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
