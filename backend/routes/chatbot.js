// routes/chatbot.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/public", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ message: "Prompt required" });

    const openaiRes = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "text-davinci-003",
        prompt,
        max_tokens: 500,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const botResponse = openaiRes.data.choices[0].text.trim();
    res.json({ response: botResponse });
  } catch (err) {
    console.error("Chatbot error:", err.message);
    res.status(500).json({ response: "⚠️ Server error. Try again." });
  }
});

module.exports = router;
