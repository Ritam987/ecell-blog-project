// backend/routes/chatbot.js
const express = require("express");
const router = express.Router();
const { generateAnswer } = require("../utils/chatbotLogic");

// Public endpoint for chatbot queries
router.get("/public", async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) return res.status(400).json({ error: "Query parameter is required." });

    const answer = await generateAnswer(query);
    res.status(200).json({ answer });
  } catch (err) {
    console.error("Chatbot error:", err.message);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

module.exports = router;
