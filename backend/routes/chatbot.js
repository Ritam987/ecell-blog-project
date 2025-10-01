const express = require("express");
const router = express.Router();
const { getAnswer } = require("../utils/chatbotLogic");

// Public endpoint: /api/chatbot/public?query=...
router.get("/public", async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const answer = await getAnswer(query);
    res.json({ answer });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

module.exports = router;
