const express = require("express");
const router = express.Router();
const fetch = require("node-fetch"); // make sure node-fetch is installed

// Rule-based answers (fast, no OpenAI call needed)
const RULES = {
  "how to login": "To login, go to the Login page from the navbar and enter your email and password.",
  "how to register": "To register, click on Register in the navbar, fill the form, and submit.",
  "how to logout": "To logout, click on your profile menu and select Logout.",
  "how to post": "If you’re logged in, click 'Create Blog' in the navbar to write and publish.",
  "how to edit blog": "If you're the author, open your blog and click the Edit button to update it.",
  "how to delete blog": "If you're the author, open your blog and click Delete to remove it.",
  "how to read full blog": "Click 'Read More' on any blog card to open and read the full blog.",
};

// Public chatbot endpoint (no auth required)
router.post("/public", async (req, res) => {
  try {
    const { message } = req.body;
    console.log("📩 Incoming chatbot message:", message);

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const lowerMsg = message.toLowerCase();

    // Check rules first
    for (const key of Object.keys(RULES)) {
      if (lowerMsg.includes(key)) {
        console.log("✅ Rule matched:", key);
        return res.json({ reply: RULES[key] });
      }
    }

    // Otherwise use OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // lightweight model for cost efficiency
        messages: [
          { role: "system", content: "You are a helpful blogging assistant chatbot." },
          { role: "user", content: message },
        ],
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    console.log("🔍 OpenAI raw response:", data);

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content || "⚠️ No response generated.";
    res.json({ reply });
  } catch (error) {
    console.error("🔥 Chatbot server error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;
