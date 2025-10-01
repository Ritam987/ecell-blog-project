const express = require("express");
const fetch = require("node-fetch");

const router = express.Router();

// Public hybrid chatbot endpoint
router.get("/public", async (req, res) => {
  const userQuery = req.query.query;
  if (!userQuery) return res.status(400).json({ answer: "Query is required" });

  try {
    // Rule-based responses
    const rules = {
      "how to login": "You can login by clicking the login button and entering your credentials.",
      "how to register": "Click on the register button and fill in the required details.",
      "how to logout": "Click on your profile and select logout.",
      "how to edit blog": "Only the author can edit a blog. Go to the blog details page and click 'Edit'.",
      "how to delete blog": "Only the author or admin can delete a blog. Click 'Delete' on your blog details page.",
      "how to read full blog": "Click 'More' on the blog snippet in the home page to read the full content.",
    };

    const lowerQuery = userQuery.toLowerCase();
    const ruleKeys = Object.keys(rules);
    let ruleAnswer = null;
    for (let key of ruleKeys) {
      if (lowerQuery.includes(key)) {
        ruleAnswer = rules[key];
        break;
      }
    }

    if (ruleAnswer) return res.status(200).json({ answer: ruleAnswer });

    // AI response via free GPT API
    const response = await fetch(`https://free-unoficial-gpt4o-mini-api-g70n.onrender.com/chat/?query=${encodeURIComponent(
      userQuery
    )}`,
    {
        method: "GET",
        headers: { Accept: "application/json" },
    }
  );

   const data = await response.json();

// Free GPT API might return: data.response OR data.answer OR data.text
   aiAnswer = data.response || data.answer || data.text || "Sorry, I could not generate an answer.";

res.status(200).json({ answer: aiAnswer });
    const aiAnswer = data.response || "Sorry, I could not generate an answer.";

    res.status(200).json({ answer: aiAnswer });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ answer: "⚠️ Server error: " + err.message });
  }
});

module.exports = router;
