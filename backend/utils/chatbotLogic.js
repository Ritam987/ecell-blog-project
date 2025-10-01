const fetch = require("node-fetch");

// Rule-based responses
const rules = [
  { question: /login/i, answer: "To login, click on the Login button and enter your credentials." },
  { question: /register/i, answer: "To register, click on Register and fill out the form." },
  { question: /logout/i, answer: "To logout, click on your profile and select Logout." },
  { question: /edit blog/i, answer: "If you are the author, click 'Edit' on your blog to make changes." },
  { question: /delete blog/i, answer: "If you are the author, click 'Delete' on your blog to remove it." },
  { question: /read full blog/i, answer: "Click 'More' on the blog preview to read the full post." }
];

// Check rule-based answers first
function getRuleBasedAnswer(query) {
  const rule = rules.find(r => r.question.test(query));
  return rule ? rule.answer : null;
}

// Hugging Face AI Answer
async function generateAIAnswer(query) {
  try {
    const apiKey = process.env.HUGGING_FACE_API_KEY;
    if (!apiKey) throw new Error("Hugging Face API key is missing");

    const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: query })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    // GPT2 returns generated text in data[0].generated_text
    return data[0]?.generated_text || "Sorry, I could not generate a response.";
  } catch (err) {
    console.error("Chatbot error:", err);
    return `⚠️ Server error: ${err.message}`;
  }
}

async function getAnswer(query) {
  const ruleAnswer = getRuleBasedAnswer(query);
  if (ruleAnswer) return ruleAnswer;

  // Otherwise fallback to AI
  return await generateAIAnswer(query);
}

module.exports = { getAnswer };
