const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

// Public chatbot endpoint - no authentication
router.post("/public", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ answer: "⚠️ No message provided." });
  }

  try {
    // Example rule-based responses
    const lowerMsg = userMessage.toLowerCase();
    let ruleBasedResponse = null;

    if (lowerMsg.includes("how to login")) {
      ruleBasedResponse = "To login, click the 'Login' button at the top right and enter your credentials.";
    } else if (lowerMsg.includes("how to register")) {
      ruleBasedResponse = "To register, click 'Register', fill in the details, and submit the form.";
    } else if (lowerMsg.includes("edit blog")) {
      ruleBasedResponse = "If you are the author, visit your blog and click the 'Edit' button.";
    } else if (lowerMsg.includes("delete blog")) {
      ruleBasedResponse = "Authors can delete their blogs using the 'Delete' button on their blog page.";
    } else if (lowerMsg.includes("read full blog")) {
      ruleBasedResponse = "Click 'Read More' on a blog to see its full content.";
    }

    if (ruleBasedResponse) {
      return res.json({ answer: ruleBasedResponse });
    }

    // Otherwise, fallback to AI (OpenAI GPT-3.5 / GPT-4)
    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
        max_tokens: 500,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const aiAnswer = openaiResponse.data.choices[0].message.content;
    return res.json({ answer: aiAnswer });
  } catch (err) {
    console.error("Chatbot backend error:", err.response?.data || err.message);
    return res.status(500).json({
      answer:
        err.response?.data?.error?.message ||
        err.message ||
        "⚠️ Server error while generating response. Try again.",
    });
  }
});

module.exports = router;
