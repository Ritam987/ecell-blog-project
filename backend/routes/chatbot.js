const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// Define site-specific rules
const rules = [
  { patterns: ["login"], response: "To login, click on the Login button at the top-right corner and enter your credentials." },
  { patterns: ["register", "signup"], response: "To register, click on the Sign Up button, fill in your details and submit." },
  { patterns: ["logout"], response: "To logout, click on your profile and select Logout." },
  { patterns: ["home", "all blogs"], response: "To see all blogs, click on the Home button. You can scroll through all posts." },
  { patterns: ["read blog", "full blog"], response: "Click on 'Read More' on any blog card to view the full content." },
  { patterns: ["edit blog"], response: "If you are the author of a blog, you will see an Edit button on the blog card or blog details page. Click it to edit your post." },
  { patterns: ["delete blog"], response: "If you are the author, a Delete button will appear. Click it to remove your blog." },
  { patterns: ["author actions"], response: "As a blog author, you can Edit or Delete your posts. These buttons are visible only to you." },
  { patterns: ["how to post"], response: "Click on 'Create Blog' after logging in to post a new blog. Fill in the title, content, tags, and optionally upload an image." },
  { patterns: ["help", "support"], response: "If you need guidance, just type your question here and I will help you navigate the site." },
  { patterns: ["hi", "hello", "hey"], response: "Hello! I'm your site assistant. I can guide you on login, registration, and blog actions." },
  { patterns: ["bye", "goodbye"], response: "Goodbye! If you have more questions, just type them here." },
];

// POST /api/chatbot
router.post("/", auth, (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "Message required" });

  const msgLower = message.toLowerCase();

  let reply = "Sorry, I didn't understand that. You can ask me about login, registration, posting or editing blogs.";
  for (let rule of rules) {
    if (rule.patterns.some((p) => msgLower.includes(p))) {
      reply = rule.response;
      break;
    }
  }

  res.json({ reply });
});

module.exports = router;
