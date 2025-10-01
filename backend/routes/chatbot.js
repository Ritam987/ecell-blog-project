const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Rule-based responses
const rules = [
  { keywords: ["login"], response: "To login, go to the Login page and enter your credentials." },
  { keywords: ["register", "signup"], response: "To register, go to the Register page and fill the form." },
  { keywords: ["logout"], response: "Click the Logout button in the navbar to sign out." },
  { keywords: ["edit blog"], response: "If you are the author, visit your blog and click Edit to update it." },
  { keywords: ["delete blog"], response: "Authors can delete their own blogs by clicking Delete on the blog page." },
  { keywords: ["read full blog"], response: "Click 'Read More' on any blog to view the full content." },
];

// POST /api/chatbot
router.post("/", auth, async (req, res) => {
  try {
    const { prompt } = req.body;
    const lowerPrompt = prompt.toLowerCase();

    // Check rules first
    const ruleResponse = rules.find((r) =>
      r.keywords.some((k) => lowerPrompt.includes(k))
    );
    if (ruleResponse) {
      return res.json({ reply: ruleResponse.response });
    }

    // AI fallback for other queries
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const reply = aiResponse.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ reply: "Server error. Try again later." });
  }
});

module.exports = router;
