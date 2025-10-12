// routes/chatbot.js (CommonJS version)

const express = require("express");
const fetch = require("node-fetch"); // npm i node-fetch

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required." });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-oss-20b",
        messages: [
          { role: "system", content: "You are a friendly AI chatbot assistant." },
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
      reply: aiReply || "Hmm... I’m not sure about that, could you rephrase?",
    });
  } catch (error) {
    console.error("Chatbot backend error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
