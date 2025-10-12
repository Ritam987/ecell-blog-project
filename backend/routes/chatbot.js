// routes/chatbot.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // set this in Render

router.post("/", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "No message provided." });

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "gpt-oss-20b",
        messages: [{ role: "user", content: message }],
        temperature: 0.7,
        max_tokens: 200,
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err.response?.data || err.message);
    res.json({ reply: "Sorry, I couldn't understand that. Can you rephrase?" });
  }
});

module.exports = router;
