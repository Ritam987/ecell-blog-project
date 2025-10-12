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

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    setVisible(false);
    setMessages([
      { type: "bot", text: "Hello! I am Scooby Doo, your personal assistant. Click a question below for instant answers or ask any general question." }
    ]);
  }, [location.pathname]);

  const getRuleBasedAnswer = useCallback((question) => {
    const categories = Object.values(ruleBasedQA).flat();
    const match = categories.find(
      (qa) => qa.question.toLowerCase().trim() === question.toLowerCase().trim()
    );
    return match ? match.answer : null;
  }, []);

  const handleQuestionClick = (qa) => {
    if (!isProcessing) {
      setMessages((prev) => [
        ...prev,
        { type: "user", text: qa.question },
        { type: "bot", text: qa.answer },
      ]);
    }
  };

  const sendMessage = async (text) => {
    const query = text.trim();
    if (!query) return;

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

  const handleInputSubmit = (e) => {
    if (e.key === "Enter" && inputText.trim() && !isProcessing) {
      sendMessage(inputText);
    }
  };

  const renderMessage = (msg) => {
    if (msg.text.startsWith("```")) {
      const languageMatch = msg.text.match(/```(\w+)/);
      const lang = languageMatch ? languageMatch[1] : "";
      const code = msg.text.replace(/```[\w]*\n?/, "").replace(/```$/, "");
      return <SyntaxHighlighter language={lang} style={dark}>{code}</SyntaxHighlighter>;
    }
    return <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>;
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
      {/* Floating Robot Icon */}
      <motion.div
        className="mb-2 p-3 rounded-full cursor-pointer flex items-center justify-center"
        style={{ backgroundColor: NEON_BLUE, boxShadow: `0 0 20px ${NEON_BLUE}` }}
        onClick={() => setVisible(!visible)}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.2, boxShadow: `0 0 30px ${NEON_BLUE}` }}
        whileTap={{ scale: 0.95 }}
      >
        <FaRobot size={28} color={DARK_BG} />
      </motion.div>

      <AnimatePresence>
        {visible && (
          <motion.div
            className="w-80 max-w-full rounded-lg flex flex-col overflow-hidden"
            style={{ backgroundColor: DARK_BG, border: `2px solid ${NEON_BLUE}`, boxShadow: `0 0 20px ${NEON_BLUE}`, minHeight: "450px" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="px-4 py-3 font-bold text-lg flex justify-between items-center" style={{ backgroundColor: NEON_BLUE, color: DARK_BG, boxShadow: `0 0 10px ${NEON_BLUE}` }}>
              Scooby Doo Assistant
              <button onClick={() => setVisible(false)} className="text-xl font-bold hover:text-gray-700 transition-colors">&times;</button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3" style={{ maxHeight: "300px" }}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.type === "user" ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                  className={`max-w-[80%] p-3 rounded-xl shadow-lg text-sm break-words ${
                    msg.type === "user" ? "bg-neonPink text-white ml-auto rounded-br-none" : "bg-neonGreen text-black mr-auto rounded-tl-none"
                  }`}
                >
                  {renderMessage(msg)}
                </motion.div>
              ))}
              {isProcessing && (
                <div className="flex items-center p-2 text-xs text-gray-400 italic">Assistant is typing...</div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-neonBlue flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleInputSubmit}
                placeholder={isProcessing ? "Waiting for response..." : "Ask a question..."}
                disabled={isProcessing}
                className="flex-1 px-3 py-2 rounded-full text-white outline-none"
                style={{ backgroundColor: "rgba(50,50,50,0.5)", border: `1px solid ${NEON_BLUE}`, boxShadow: `0 0 5px ${NEON_BLUE}` }}
              />
              <motion.button
                onClick={() => sendMessage(inputText)}
                disabled={!inputText.trim() || isProcessing}
                whileHover={{ scale: !inputText.trim() || isProcessing ? 1 : 1.05 }}
                whileTap={{ scale: !inputText.trim() || isProcessing ? 1 : 0.95 }}
                className={`px-3 py-2 rounded-full font-semibold text-xs flex items-center ${!inputText.trim() || isProcessing ? "opacity-50 cursor-not-allowed" : "bg-neonBlue text-black"}`}
                style={{ boxShadow: `0 0 10px ${NEON_BLUE}` }}
              >
                Send
              </motion.button>
            </div>

            {/* Rule-based Buttons */}
            <div className="p-3 border-t border-neonBlue flex flex-col gap-3">
              {Object.entries(ruleBasedQA).map(([category, qas], idx) => (
                <div key={idx}>
                  <div className="font-bold text-white mb-1">{category}</div>
                  <div className="flex flex-wrap gap-2">
                    {qas.map((qa, i) => (
                      <motion.button
                        key={i}
                        onClick={() => handleQuestionClick(qa)}
                        whileHover={{ scale: 1.05, boxShadow: `0 0 10px ${NEON_PINK}` }}
                        className="bg-gray-800 text-white px-3 py-1 rounded shadow-lg"
                        style={{ border: `1px solid ${NEON_PINK}` }}
                      >
                        {qa.question}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

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
