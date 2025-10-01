// backend/utils/chatbotLogic.js
const { OpenAI } = require("openai");

const client = new OpenAI({
  apiKey:'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', // replace with env or hardcode temporarily
});

// Rule-based responses
const ruleBasedResponses = {
  "how to login": "To login, click on the Login button and enter your credentials.",
  "how to register": "To register, click on the Register button and fill the form.",
  "how to logout": "Click on your profile and then click Logout.",
  "how to edit blog": "Go to your blog, click 'Edit', make changes, and save.",
  "how to delete blog": "Go to your blog, click 'Delete', and confirm.",
  "how to read full blog": "Click on 'Read More' of any blog to read the full content.",
};

async function generateAnswer(message) {
  try {
    // Check rule-based first
    const lowerMsg = message.toLowerCase();
    for (const key in ruleBasedResponses) {
      if (lowerMsg.includes(key)) {
        return ruleBasedResponses[key];
      }
    }

    // AI response via OpenAI
    const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for the E-Cell blogging website.",
        },
        { role: "user", content: message },
      ],
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("Chatbot error:", err);
    return "⚠️ Server error: " + err.message;
  }
}

module.exports = { generateAnswer };
