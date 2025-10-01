const express = require("express");
const router = express.Router();
const { generateAnswer } = require("../utils/chatbotLogic");

// PUBLIC endpoint
router.get("/public", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.status(400).json({ error: "Query parameter missing" });

  try {
    const answer = await generateAnswer(query);
    res.json({ answer });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

module.exports = router; // ✅ Must export the router, not an object
