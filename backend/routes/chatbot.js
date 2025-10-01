const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");

// Define your rule-based responses
const rules = [
  { question: "how to login", answer: "To login, go to the Login page and enter your credentials." },
  { question: "how to register", answer: "To register, click on Register and fill the form." },
  { question: "how to logout", answer: "Click the Logout button in the Navbar to logout." },
  { question: "how to edit blog", answer: "If you are the author, open your blog and click 'Edit'." },
  { question: "how to delete blog", answer: "If you are the author, open your blog and click 'Delete'." },
  { question: "how to read full blog", answer: "Click on 'Read More' to view the full blog post." },
];

// Public endpoint for chat
router.get("/public", async (req, res) => {
  try {
    const userQuery = req.query.query;
    if (!userQuery) return res.status(400).json({ answer: "Query is required" });

    // Check rule-based first (case-insensitive)
    const rule = rules.find(r => userQuery.toLowerCase().includes(r.question.toLowerCase()));
    if (rule) return res.json({ answer: rule.answer });

    // Else call Free GPT API
    const response = await fetch(
      `https://free-unoficial-gpt4o-mini-api-g70n.onrender.com/chat/?query=${encodeURIComponent(userQuery)}`,
      { method: "GET", headers: { Accept: "application/json" } }
    );

    const data = await response.json();

    // Free API might return different field names
    const aiAnswer = data.response || data.answer || data.text || "Sorry, I could not generate an answer.";

    res.json({ answer: aiAnswer });

  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ answer: `⚠️ Server error: ${error.message}` });
  }
});

module.exports = router;
