// backend/utils/chatbotLogic.js
const fetch = require("node-fetch");

// Rule-based responses for site-specific questions
const ruleBasedResponses = [
  { keywords: ["login"], response: "To login, click on the Login page and enter your credentials." },
  { keywords: ["register", "signup"], response: "To register, go to the Register page and create an account." },
  { keywords: ["logout"], response: "To logout, click on the Logout button in the navbar." },
  { keywords: ["create blog"], response: "As an author, you can create a blog via the 'Create Blog' page." },
  { keywords: ["edit blog"], response: "To edit your blog, navigate to the blog details page and click 'Edit' if you are the author." },
  { keywords: ["delete blog"], response: "To delete a blog, navigate to its details page and click 'Delete' if you are the author." },
  { keywords: ["read full blog", "full post"], response: "Click 'Read More' on the blog summary to view the full blog post." }
];

// Function to get rule-based response
function getRuleBasedAnswer(query) {
  const q = query.toLowerCase();
  for (let rule of ruleBasedResponses) {
    if (rule.keywords.some(k => q.includes(k))) return rule.response;
  }
  return null; // no rule-based answer found
}

// Function to get AI response from Hugging Face
async function getAIResponse(query) {
  const HF_API_KEY = process.env.HF_API_KEY; // must be set in Render environment
  const model = "distilgpt2"; // free GPT-2 based model

  if (!HF_API_KEY) throw new Error("Hugging Face API key is missing.");

  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: query })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Hugging Face API error: ${response.status} ${errText}`);
  }

  const data = await response.json();

  if (data.error) throw new Error(`Hugging Face API error: ${data.error}`);

  // The model returns an array of generated texts
  if (Array.isArray(data) && data[0]?.generated_text) return data[0].generated_text;
  if (Array.isArray(data) && typeof data[0] === "string") return data[0];

  return "Sorry, I couldn't generate an answer.";
}

// Main hybrid chatbot function
async function generateAnswer(query) {
  // Check rule-based first
  const ruleAnswer = getRuleBasedAnswer(query);
  if (ruleAnswer) return ruleAnswer;

  // Otherwise, call AI
  try {
    const aiAnswer = await getAIResponse(query);
    return aiAnswer;
  } catch (err) {
    console.error("Chatbot error:", err.message);
    return `⚠️ Server error: ${err.message}`;
  }
}

module.exports = { generateAnswer };
