// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { FaRobot, FaCopy, FaExpand, FaCompress } from "react-icons/fa";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const [compact, setCompact] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  const chatEndRef = useRef(null);
  const location = useLocation();

  // --- Scroll to bottom on new message ---
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // --- Reset on route change ---
  useEffect(() => {
    setVisible(false);
    setMessages([
      { type: "bot", text: "Hello! I am Scooby Doo, your personal assistant. Click a question below for instant answers or ask any general question." }
    ]);
  }, [location.pathname]);

  // --- Rule-based matching ---
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

  // --- Typing Animation ---
  const typeText = (fullText) => {
    return new Promise((resolve) => {
      let index = 0;
      const interval = setInterval(() => {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullText.slice(0, index + 1);
          return newMessages;
        });
        index++;
        if (index === fullText.length) {
          clearInterval(interval);
          resolve();
        }
      }, 15); // 15ms per character
    });
  };

  // --- Send Message (with streaming effect) ---
  const sendMessage = async (text) => {
    const query = text.trim();
    if (!query) return;

    const ruleAnswer = getRuleBasedAnswer(query);
    if (ruleAnswer) {
      setMessages((prev) => [
        ...prev,
        { type: "user", text: query },
        { type: "bot", text: "" },
      ]);
      setInputText("");
      await typeText(ruleAnswer);
      return;
    }

    setMessages((prev) => [...prev, { type: "user", text: query }, { type: "bot", text: "" }]);
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

      await typeText(botReply);
    } catch (err) {
      console.error(err);
      await typeText("❌ Network Error: Unable to connect.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputSubmit = (e) => {
    if (e.key === "Enter" && inputText.trim() && !isProcessing) sendMessage(inputText);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => alert("AI response copied!"));
  };

  const renderMessage = (msg) => {
    const bubbleClasses = msg.type === "user"
      ? "ml-auto bg-neonPink text-white rounded-xl rounded-br-none p-2 sm:p-3 max-w-[90%] sm:max-w-[80%] break-words text-sm sm:text-base leading-relaxed"
      : "mr-auto bg-neonGreen text-black rounded-xl rounded-tl-none p-2 sm:p-3 max-w-[90%] sm:max-w-[80%] break-words text-sm sm:text-base leading-relaxed relative";

    return (
      <div className={bubbleClasses}>
        {msg.type === "bot" ? (
          <>
            <button
              className="absolute top-1 right-1 text-xs text-gray-700 hover:text-gray-900"
              onClick={() => copyToClipboard(msg.text)}
              title="Copy response"
            >
              <FaCopy />
            </button>
            <div className="overflow-auto max-h-[60vh] sm:max-h-72 md:max-h-96">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-xl sm:text-2xl font-bold mb-1" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg sm:text-xl font-bold mb-1" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-md sm:text-lg font-semibold mb-1" {...props} />,
                  p: ({node, ...props}) => <p className="mb-1" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                  em: ({node, ...props}) => <em className="italic" {...props} />,
                  u: ({node, ...props}) => <u className="underline" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-400 underline" {...props} />,
                  img: ({node, ...props}) => <img className="my-2 rounded max-w-full" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-1" {...props} />,
                  table: ({node, ...props}) => <table className="border border-gray-500 mb-2 w-full text-sm sm:text-base" {...props} />,
                  th: ({node, ...props}) => <th className="border border-gray-500 px-2 py-1 bg-gray-700 text-white" {...props} />,
                  td: ({node, ...props}) => <td className="border border-gray-500 px-2 py-1" {...props} />,
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="overflow-auto max-h-60 sm:max-h-72 md:max-h-96 my-2 rounded border border-gray-600">
                        <SyntaxHighlighter style={dark} language={match[1]} {...props}>
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="bg-gray-700 text-white px-1 rounded text-xs sm:text-sm" {...props}>{children}</code>
                    );
                  },
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-400 pl-3 italic my-2" {...props} />
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          </>
        ) : msg.text}
      </div>
    );
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={{ top: 0, left: 0, right: window.innerWidth - 50, bottom: window.innerHeight - 50 }}
      dragElastic={0.2}
      style={{ x: dragPosition.x, y: dragPosition.y }}
      className="fixed bottom-4 right-2 z-50"
    >
      {/* Floating Robot */}
      {!visible && (
        <motion.div
          className="p-3 rounded-full cursor-pointer flex items-center justify-center"
          style={{ backgroundColor: NEON_BLUE, boxShadow: `0 0 20px ${NEON_BLUE}` }}
          onClick={() => setVisible(true)}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.2, boxShadow: `0 0 30px ${NEON_BLUE}` }}
          whileTap={{ scale: 0.95 }}
        >
          <FaRobot size={28} color={DARK_BG} />
        </motion.div>
      )}

      <AnimatePresence>
        {visible && !compact && (
          <motion.div
            className="w-full sm:w-80 max-w-full rounded-lg flex flex-col overflow-hidden"
            style={{ backgroundColor: DARK_BG, border: `2px solid ${NEON_BLUE}`, boxShadow: `0 0 20px ${NEON_BLUE}`, minHeight: "450px" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="px-4 py-3 font-bold text-lg flex justify-between items-center" style={{ backgroundColor: NEON_BLUE, color: DARK_BG }}>
              Scooby Doo Assistant
              <div className="flex items-center gap-2">
                <button onClick={() => setCompact(!compact)} className="hover:text-gray-700 transition-colors">
                  {compact ? <FaExpand /> : <FaCompress />}
                </button>
                <button onClick={() => setVisible(false)} className="text-xl font-bold hover:text-gray-700 transition-colors">&times;</button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3" style={{ maxHeight: "300px" }}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.type === "user" ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
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
    </motion.div>
  );
};

export default Chatbot;
