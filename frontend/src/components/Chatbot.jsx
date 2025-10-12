// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { FaRobot } from "react-icons/fa"; // cute robot icon

// --- Configuration ---
const CHAT_PROXY_URL = "https://ecell-blog-project.onrender.com/api/chatbot"; // backend endpoint

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
    { type: "bot", text: "Hello! I am Scooby Doo, your assistant. Click a question below or ask me anything." },
  ]);
  const [visible, setVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const chatEndRef = useRef(null);
  const location = useLocation();

  // scroll to bottom when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // auto-hide chatbot and reset when route changes
  useEffect(() => {
    setVisible(false);
    setMessages([
      { type: "bot", text: "Hello! I am Scooby Doo, your assistant. Click a question below or ask me anything." },
    ]);
  }, [location.pathname]);

  // --- Rule-based lookup ---
  const getRuleBasedAnswer = useCallback((question) => {
    const allQA = Object.values(ruleBasedQA).flat();
    const match = allQA.find(
      (qa) => qa.question.toLowerCase().trim() === question.toLowerCase().trim()
    );
    return match ? match.answer : null;
  }, []);

  const handleQuestionClick = (qa) => {
    if (isProcessing) return;
    setMessages((prev) => [
      ...prev,
      { type: "user", text: qa.question },
      { type: "bot", text: qa.answer },
    ]);
  };

  // --- AI Chat Handler ---
  const sendMessage = async (text) => {
    const query = text.trim();
    if (!query) return;

    // Check for rule-based answer first
    const ruleAnswer = getRuleBasedAnswer(query);
    if (ruleAnswer) {
      setMessages((prev) => [...prev, { type: "user", text: query }, { type: "bot", text: ruleAnswer }]);
      setInputText("");
      return;
    }

    // Send user message to AI backend
    setMessages((prev) => [...prev, { type: "user", text: query }]);
    setInputText("");
    setIsProcessing(true);

    try {
      const res = await fetch(CHAT_PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      let botReply = "";

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        botReply = data.reply || data.message || JSON.stringify(data);
      } else {
        botReply = await res.text();
        if (!botReply.trim()) botReply = `⚠️ Empty response (HTTP ${res.status})`;
      }

      setMessages((prev) => [...prev, { type: "bot", text: botReply }]);
    } catch (err) {
      console.error("Chatbot fetch error:", err);
      setMessages((prev) => [...prev, { type: "bot", text: "❌ Network error. Please try again." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputSubmit = (e) => {
    if (e.key === "Enter" && inputText.trim() && !isProcessing) sendMessage(inputText);
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
      {/* Floating Animated Robot Icon */}
      <motion.div
        className="mb-2 bg-neonBlue text-white p-3 rounded-full shadow-neon cursor-pointer flex items-center justify-center"
        onClick={() => setVisible(!visible)}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.2, boxShadow: "0 0 15px #39ff14" }}
        whileTap={{ scale: 0.95 }}
      >
        <FaRobot size={28} />
      </motion.div>

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
            <div
              className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-2"
              style={{ maxHeight: "300px" }}
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.type === "user" ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-2 rounded break-words ${
                    msg.type === "user"
                      ? "bg-neonPink text-white text-right self-end"
                      : "bg-neonGreen text-black text-left self-start"
                  }`}
                >
                  {msg.text}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-2 rounded text-xs bg-neonBlue text-black self-start"
                  >
                    Assistant is typing...
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-2 border-t border-neonBlue flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleInputSubmit}
                placeholder={isProcessing ? "Waiting for response..." : "Ask a question..."}
                disabled={isProcessing}
                className="flex-1 px-3 py-1 rounded-full text-white outline-none bg-gray-800 border border-neonBlue"
              />
              <button
                onClick={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isProcessing}
                className="px-3 py-1 bg-neonBlue text-black rounded-full font-semibold"
              >
                Send
              </button>
            </div>

            {/* Categorized Buttons */}
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

            {/* Custom scrollbar */}
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar { width: 6px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: #1a1a1a; border-radius: 4px; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #888; }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
