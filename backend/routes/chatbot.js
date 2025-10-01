import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Public endpoint (no authentication)
router.post("/public", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Check if query is "write a blog"
    const isBlogRequest = message.toLowerCase().includes("write a blog");

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful hybrid chatbot. You can answer rules-based questions and generate blogs if asked.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API Error:", error);
      return res.status(500).json({ error: "Failed to fetch from OpenAI API" });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.json({
      reply,
      isBlog: isBlogRequest, // frontend can use this to show "Save Blog" later if needed
    });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

export default router;
