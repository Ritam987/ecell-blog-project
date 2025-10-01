// Hybrid chatbot logic - rule-based + optional AI integration

async function generateAnswer(message) {
  const lower = message.toLowerCase();

  // Rule-based responses
  if (lower.includes("login")) return "To login, go to /login page.";
  if (lower.includes("register")) return "To register, go to /register page.";
  if (lower.includes("logout")) return "To logout, click on the logout button in navbar.";
  if (lower.includes("edit blog")) return "If you are the author, click 'Edit' on your blog to modify it.";
  if (lower.includes("delete blog")) return "Only the author or admin can delete a blog using the delete button.";
  if (lower.includes("read full blog")) return "Click on 'Read More' to see the full content of any blog.";

  // Optional: AI-generated responses (e.g., OpenAI)
  // Uncomment below and configure OPENAI_API_KEY in Render environment variables
  
  const { Configuration, OpenAIApi } = require("openai");
  const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(config);

  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }],
  });

  if (response?.data?.choices?.[0]?.message?.content) {
    return response.data.choices[0].message.content;
  }
  

  return "I am not sure about that. Please ask something else!";
}

module.exports = { generateAnswer };
