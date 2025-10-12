// routes/chatbot.js

import express from "express";
import fetch from "node-fetch";

const router = express.Router();

/**
 * @route   POST /api/chatbot
 * @desc    Handles user messages and gets AI responses from gpt-oss-20b
 * @access  Public
 */
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    // Validation
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required." });
    }

    // Call OpenAI API (gpt-oss-20b model)
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, // Set in Render
      },
      body: JSON.stringify({
        model: "gpt-oss-20b", // ✅ Using free open model
        messages: [
          {
            role: "system",
            content: "You are a friendly, smart chatbot assistant for a website. Be concise, polite, and helpful.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI API Error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

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

export default router;
