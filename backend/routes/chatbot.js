// routes/chatbot.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// PUBLIC Chatbot API (no authentication)
router.post("/public", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Detect if user wants a blog
    const isBlogRequest = message.toLowerCase().startsWith("write a blog");

    const systemPrompt = isBlogRequest
      ? "You are a helpful blog writer AI. Write a structured, engaging blog post based on the user request."
      : "You are a rule-based assistant that also answers general queries.";

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content || "No reply generated.";
    res.json({ reply, isBlogRequest });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
