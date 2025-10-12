// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { FaRobot } from "react-icons/fa"; // cute robot icon

// Your existing rule-based QA
const ruleBasedQA = {
  "User Actions": [
    { question: "How to login?", answer: "Click on the Login button in the navbar and enter your credentials." },
    { question: "How to register?", answer: "Click on Register, fill in the details, and submit." },
    { question: "How to logout?", answer: "Click on your profile and select Logout." },
    { question: "How to create a blog?", answer: "Click on 'Create Blog' in the navbar and fill out the form." },
    { question: "How to edit my blog?", answer: "Go to your blog details page and click 'Edit' if you are the author." },
    { question: "How to delete my blog?", answer: "Go to your blog details page and click 'Delete' if you are the author." },
    { question: "How can I read the full blog?", answer: "Click on 'More' on the blog card to view the full content." },
    { question: "How can I like a blog?", answer: "On any blog page or blog card, click the 'Like' button to like or unlike a blog." },
    { question: "How can I comment on a blog?", answer: "Go to the blog details page, type your comment in the comment box, and click 'Submit'." },
  ],
  "Admin Actions": [
    { question: "How to access admin panel?", answer: "If your account has admin rights, click on 'Admin Panel' in the navbar to manage users and blogs." },
  ],
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! I am your assistant. Click a question below or type a message." },
  ]);
  const [visible, setVisible] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const chatEndRef = useRef(null);
  const location = useLocation();

  // Scroll to bottom when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-hide chatbot and reset on route change
  useEffect(() => {
    setVisible(false);
    setMessages([{ type: "bot", text: "Hello! I am your assistant. Click a question below or type a message." }]);
  }, [location.pathname]);

  // Handle user sending a message to backend
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const messageText = userMessage.trim();
    setMessages((prev) => [...prev, { type: "user", text: messageText }]);
    setUserMessage("");

    try {
      const res = await fetch("https://ecell-blog-project.onrender.com/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { type: "bot", text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { type: "bot", text: "Sorry, I couldn't understand that. Can you rephrase?" }]);
    }
  };

  // Handle rule-based QA button click
  const handleQuestionClick = (qa) => {
    setMessages((prev) => [
      ...prev,
      { type: "user", text: qa.question },
      { type: "bot", text: qa.answer },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end z-50">
      {/* Floating Robot Icon */}
      <motion.button
        className="mb-2 w-14 h-14 rounded-full bg-neonBlue text-white flex items-center justify-center shadow-neon cursor-pointer"
        onClick={() => setVisible((prev) => !prev)}
        whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0], boxShadow: "0 0 12px #39ff14" }}
        whileTap={{ scale: 0.9 }}
      >
        <FaRobot size={28} />
      </motion.button>

      {/* Chatbox */}
      <AnimatePresence>
        {visible && (
          <motion.div
            className="w-80 max-w-full bg-darkBg border border-neonBlue shadow-neon rounded-lg flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="bg-neonBlue text-white px-4 py-2 font-bold rounded-t-lg">Chatbot</div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-2" style={{ maxHeight: "300px" }}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.type === "user" ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-2 rounded ${
                    msg.type === "user"
                      ? "bg-neonPink text-white text-right self-end"
                      : "bg-neonGreen text-black text-left self-start"
                  }`}
                >
                  {msg.text}
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* User Input */}
            <form onSubmit={sendMessage} className="flex border-t border-neonBlue">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-darkBg text-white outline-none"
              />
              <button type="submit" className="px-4 bg-neonBlue text-white hover:bg-neonPink transition-colors">
                Send
              </button>
            </form>

            {/* Rule-Based QA Buttons */}
            <div className="p-2 border-t border-neonBlue flex flex-col gap-2">
              {Object.entries(ruleBasedQA).map(([category, qas], idx) => (
                <div key={idx}>
                  <div className="font-semibold text-white mb-1">{category}</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {qas.map((qa, i) => (
                      <motion.button
                        key={i}
                        onClick={() => handleQuestionClick(qa)}
                        whileHover={{ scale: 1.05, boxShadow: "0 0 10px #ff00ff" }}
                        className="bg-gray-700 text-white px-3 py-1 rounded shadow-neon transition-all duration-300"
                      >
                        {qa.question}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Scrollbar */}
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #1a1a1a;
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #555;
                border-radius: 4px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #888;
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
