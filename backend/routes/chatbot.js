// chatbot.js
import express from "express";
import { generateAnswer } from "../utils/chatbotLogic.js";

const router = express.Router();

// Public endpoint, no authentication required
router.get("/public", async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) return res.json({ answer: "Please enter a query." });

    const answer = await generateAnswer(query);
    res.json({ answer });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ answer: `⚠️ Server error: ${err.message}` });
  }
});

export default router;
