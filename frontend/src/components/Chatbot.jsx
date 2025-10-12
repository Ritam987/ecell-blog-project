// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { FaRobot } from "react-icons/fa";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";

// --- CONFIGURATION ---
const CHAT_PROXY_URL = "https://ecell-blog-project.onrender.com/api/chatbot"; 
const NEON_BLUE = "#39ff14";
const NEON_PINK = "#ff00ff";
const DARK_BG = "#0a0a0a";
const NEON_GREEN = "#00ff99";

// --- RULE-BASED RESPONSES ---
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

// --- CHATBOT COMPONENT ---
const Chatbot = () => {
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! I am Scooby Doo, your personal assistant. Click a question below for instant answers or ask any general question." }
  ]);
  const [visible, setVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const chatEndRef = useRef(null);
  const location = useLocation();

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset chatbot on route change
  useEffect(() => {
    setVisible(false);
    setMessages([
      { type: "bot", text: "Hello! I am Scooby Doo, your personal assistant. Click a question below for instant answers or ask any general question." }
    ]);
  }, [location.pathname]);

  // Rule-based answer
  const getRuleBasedAnswer = useCallback((question) => {
    const categories = Object.values(ruleBasedQA).flat();
    const match = categories.find(
      (qa) => qa.question.toLowerCase().trim() === question.toLowerCase().trim()
    );
    return match ? match.answer : null;
  }, []);

  // Handle button click (rule-based)
  const handleQuestionClick = (qa) => {
    if (!isProcessing) {
      setMessages((prev) => [
        ...prev,
        { type: "user", text: qa.question },
        { type: "bot", text: qa.answer },
      ]);
    }
  };

  // Send message to backend AI
  const sendMessage = async (text) => {
    const query = text.trim();
    if (!query) return;

    // Check rule-based first
    const ruleAnswer = getRuleBasedAnswer(query);
    if (ruleAnswer) {
      setMessages((prev) => [
        ...prev,
        { type: "user", text: query },
        { type: "bot", text: ruleAnswer },
      ]);
      setInputText("");
      return;
    }

    // AI call
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
      if (res.ok) {
        const data = await res.json();
        botReply = data.reply || JSON.stringify(data);
      } else {
        botReply = `⚠️ Server Error (Status ${res.status})`;
      }

      setMessages((prev) => [...prev, { type: "bot", text: botReply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { type: "bot", text: "❌ Network Error: Unable to connect." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle enter key
  const handleInputSubmit = (e) => {
    if (e.key === "Enter" && inputText.trim() && !isProcessing) {
      sendMessage(inputText);
    }
  };

  // Render message (with code formatting)
  const renderMessage = (msg) => {
    // If AI sent Markdown code block
    if (msg.text.startsWith("```")) {
      const languageMatch = msg.text.match(/```(\w+)/);
      const lang = languageMatch ? languageMatch[1] : "";
      const code = msg.text.replace(/```[\w]*\n?/, "").replace(/```$/, "");
      return <SyntaxHighlighter language={lang} style={dark}>{code}</SyntaxHighlighter>;
    }
    // Normal text with line breaks
    return <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>;
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
      {/* Floating Robot Icon */}
      <motion.div
        className="mb-2 bg-neonBlue text-white p-3 rounded-full shadow-lg cursor-pointer flex items-center justify-center"
        onClick={() => setVisible(!visible)}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.2, boxShadow: `0 0 15px ${NEON_BLUE}` }}
        whileTap={{ scale: 0.95 }}
      >
        <FaRobot size={28} />
      </motion.div>

      {/* Chatbox */}
      <AnimatePresence>
        {visible && (
          <motion.div
            className="w-80 max-w-full bg-darkBg border border-neonBlue shadow-lg rounded-lg flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="bg-neonBlue text-black px-4 py-2 font-bold rounded-t-lg">
              Scooby Doo Assistant
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-2" style={{ maxHeight: "300px" }}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.type === "user" ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-2 rounded ${msg.type === "user" ? "bg-neonPink text-white text-right self-end" : "bg-neonGreen text-black text-left self-start"}`}
                >
                  {renderMessage(msg)}
                </motion.div>
              ))}
              {isProcessing && (
                <div className="text-xs text-gray-400 italic">Assistant is typing...</div>
              )}
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
                className="flex-1 px-3 py-2 rounded-full bg-gray-800 text-white outline-none"
                style={{ border: `1px solid ${NEON_BLUE}` }}
              />
              <button
                onClick={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isProcessing}
                className={`px-3 py-2 rounded-full font-semibold ${!inputText.trim() || isProcessing ? "opacity-50 cursor-not-allowed" : "bg-neonBlue text-black"}`}
              >
                Send
              </button>
            </div>

            {/* Rule-based buttons */}
            <div className="p-2 border-t border-neonBlue flex flex-col gap-2">
              {Object.entries(ruleBasedQA).map(([category, qas], idx) => (
                <div key={idx}>
                  <div className="font-semibold text-white mb-1">{category}</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {qas.map((qa, i) => (
                      <motion.button
                        key={i}
                        onClick={() => handleQuestionClick(qa)}
                        whileHover={{ scale: 1.05, boxShadow: `0 0 10px ${NEON_PINK}` }}
                        className="bg-gray-700 text-white px-3 py-1 rounded shadow-lg"
                      >
                        {qa.question}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom scrollbar */}
            <style>{`
              .custom-scrollbar::-webkit-scrollbar { width: 6px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: ${DARK_BG}; border-radius: 4px; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(57, 255, 20, 0.5); border-radius: 4px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${NEON_BLUE}; }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
