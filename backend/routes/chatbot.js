import express from "express";
import fetch from "node-fetch";  // If Node <18. For Node18+ you can remove this line.
const router = express.Router();

// Public AI chatbot endpoint
router.post("/public", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("📩 Incoming:", message);

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // lightweight + fast
        messages: [
          { role: "system", content: "You are an AI + rule-based assistant for a blogging site. Answer helpfully and guide users." },
          { role: "user", content: message },
        ],
      }),
    });

    console.log("📡 OpenAI status:", response.status);

    const data = await response.json();
    console.log("✅ OpenAI reply:", data);

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content || "⚠️ No reply generated.";
    res.json({ reply });
  } catch (error) {
    console.error("🔥 Chatbot error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
