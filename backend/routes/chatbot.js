// routes/chatbot.js
const express = require("express");
const fetch = require("node-fetch"); // npm i node-fetch

const router = express.Router();

// POST /api/chatbot
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required." });
    }

    // Call OpenAI GPT-OSS-20B model
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-oss-20b",
        messages: [
          { role: "system", content: "You are a helpful AI assistant for E-Cell Blogging." },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content?.trim();

    res.status(200).json({
      success: true,
      reply: aiReply || "Sorry, I couldn't understand that. Can you rephrase?",
    });
  } catch (err) {
    console.error("Chatbot backend error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
