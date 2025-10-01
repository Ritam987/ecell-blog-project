const express = require("express");
const router = express.Router();
const { generateAnswer } = require("../utils/chatbotLogic");

// Public endpoint - no authentication required
router.post("/public", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ answer: "Message is required" });

    const answer = await generateAnswer(message);
    res.json({ answer });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ answer: `⚠️ Server error: ${err.message}` });
  }
});

module.exports = router;
