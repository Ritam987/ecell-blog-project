// backend/utils/chatbotLogic.js
const OpenAI = require("openai");

// Initialize OpenAI client (v4+)
const openai = new OpenAI({
  apiKey: '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',
});

// Define simple rule-based responses
const ruleBasedResponses = [
  {
    keywords: ["login", "how to login", "sign in"],
    response: "To login, go to the login page and enter your credentials.",
  },
  {
    keywords: ["register", "signup", "create account"],
    response: "To register, click on the Register page and fill out the form.",
  },
  {
    keywords: ["logout", "sign out"],
    response: "To logout, click the Logout button in the navigation bar.",
  },
  {
    keywords: ["edit blog", "delete blog", "update blog"],
    response:
      "If you are the author of a blog, you can edit or delete it by going to the blog page and clicking Edit or Delete.",
  },
  {
    keywords: ["read full blog", "view blog"],
    response:
      "Click on 'Read More' on any blog on the home page to read the full content.",
  },
  // Add more rules as needed
];

/**
 * Check rule-based responses first
 * @param {string} message
 * @returns {string|null} - Returns rule response or null if no match
 */
function getRuleBasedResponse(message) {
  const lowerMsg = message.toLowerCase();
  for (const rule of ruleBasedResponses) {
    if (rule.keywords.some((kw) => lowerMsg.includes(kw))) {
      return rule.response;
    }
  }
  return null;
}

/**
 * Generate AI response for a given prompt
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function generateAIResponse(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("OpenAI API error:", err);
    return `⚠️ Server error: ${err.message}`;
  }
}

/**
 * Hybrid chatbot function
 * Checks rule-based responses first, then falls back to AI
 * @param {string} userMessage
 * @returns {Promise<string>}
 */
async function getHybridResponse(userMessage) {
  const ruleResponse = getRuleBasedResponse(userMessage);
  if (ruleResponse) return ruleResponse;

  // Otherwise, call AI
  return await generateAIResponse(userMessage);
}

module.exports = { getHybridResponse };
