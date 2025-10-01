// chatbotLogic.js
import fetch from "node-fetch";

// Simple rule-based responses
const rules = [
  { question: /login/i, answer: "To login, click the Login button and enter your credentials." },
  { question: /register/i, answer: "To register, click the Register button and fill the form." },
  { question: /logout/i, answer: "To logout, click on the Logout button in the navbar." },
  { question: /edit blog/i, answer: "If you are the author, open the blog and click Edit." },
  { question: /delete blog/i, answer: "If you are the author, open the blog and click Delete." },
  { question: /read full blog/i, answer: "Click on the blog title or 'More' button to read full content." }
];

// Free Hugging Face model (small, fast, public)
const HUGGINGFACE_MODEL = "google/flan-t5-small";

export async function generateAnswer(query) {
  try {
    // Check rule-based first
    for (let rule of rules) {
      if (rule.question.test(query)) return rule.answer;
    }

    // AI fallback using Hugging Face inference API (public model)
    const res = await fetch(`https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: query })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Hugging Face API error: ${res.status} ${text}`);
    }

    const data = await res.json();
    // Hugging Face returns an array of objects with generated_text
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text;
    }

    return "Sorry, I could not generate a response.";
  } catch (err) {
    console.error("Chatbot Hugging Face error:", err);
    return `⚠️ Server error: ${err.message}`;
  }
}
