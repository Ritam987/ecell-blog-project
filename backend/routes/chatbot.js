// backend/routes/chatbot.js
const express = require("express");
const fetch = global.fetch || require("node-fetch");
const auth = require("../middleware/auth");

const router = express.Router();

const RULES = [
  { keywords: ["login", "sign in"], response: "To login: go to the Login page, enter your email and password, then click Login." },
  { keywords: ["register", "sign up"], response: "To register: go to Register, fill name/email/password and submit. After that you can login." },
  { keywords: ["logout", "sign out"], response: "Click the Logout button in the navbar to sign out." },
  { keywords: ["create post", "create blog"], response: "To create a blog: go to Create Post, fill Title/Content, then click Create." },
  { keywords: ["edit blog"], response: "If you're the author, open the blog and click Edit to update it." },
  { keywords: ["delete blog"], response: "Authors can delete a blog from the blog page or dashboard." },
  { keywords: ["read full blog"], response: "Click 'Read More' to open and read the full content." },
];

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

async function handlePrompt(prompt) {
  const low = prompt.toLowerCase();

  // Rule-based first
  const matched = RULES.find((r) => r.keywords.some((k) => low.includes(k)));
  if (matched) return matched.response;

  // If no OpenAI key, fallback
  if (!OPENAI_KEY) {
    return "AI responses are unavailable (no key configured). But I can help with login/register/logout and blog actions!";
  }

  try {
    const body = {
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.6,
    };

    const openaiRes = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!openaiRes.ok) {
      return "AI service error. Please try again later.";
    }

    const data = await openaiRes.json();
    return data?.choices?.[0]?.message?.content?.trim() || "No AI answer generated.";
  } catch (err) {
    console.error("OpenAI call failed:", err);
    return "Error connecting to AI. Try later.";
  }
}

// Authenticated chatbot
router.post("/", auth, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ reply: "Missing prompt." });

  const reply = await handlePrompt(prompt);
  res.json({ reply });
});

// Public chatbot (no auth)
router.post("/public", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ reply: "Missing prompt." });

  const reply = await handlePrompt(prompt);
  res.json({ reply });
});

module.exports = router;
