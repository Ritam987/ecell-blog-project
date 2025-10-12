import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Send, Bot } from 'lucide-react'; // Using 'Bot' from lucide-react

// --- START OF CONFIGURATION (API Endpoints & Details) ---
// OpenRouter Chat Proxy (General Q&A)
const CHAT_PROXY_URL = "/api/chatbot"; 

// Details passed to the proxy server
const OPENROUTER_MODEL = "openai/gpt-oss-20b:free"; 
const APP_REFERER = 'https://ecell-blog-project.onrender.com'; 
const APP_TITLE = "E-Cell Blog Assistant";

// Custom theme colors for React styles
const NEON_BLUE = 'rgb(57, 255, 20)'; 
const NEON_PINK = '#ff00ff'; // Keeping pink for highlight/accents
const DARK_BG = 'rgb(10, 10, 10)'; 
// --- END OF CONFIGURATION ---

const ruleBasedQA = {
  "User Actions (How-to)": [
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
  "General Information": [
    { question: "How to access admin panel?", answer: "If your account has admin rights, click on 'Admin Panel' in the navbar to manage users and blogs." },
    { question: "Who are you?", answer: "I am Scooby Doo, your helpful AI assistant, powered by the OpenRouter AI service." }
  ],
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! I am Scooby Doo, your personal assistant. Click a question below for instant answers, or use the input box to ask our **OpenRouter AI** any general question." },
  ]);
  const [visible, setVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false); // For OpenRouter Chat

  const chatEndRef = useRef(null);
  const location = useLocation();
  
  // scroll to bottom when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // auto-hide chatbot and reset when route changes
  useEffect(() => {
    setVisible(false);
    setMessages([{ type: "bot", text: "Hello! I am Scooby Doo, your personal assistant. Click a question below for instant answers, or use the input box to ask our **OpenRouter AI** any general question." }]);
  }, [location.pathname]);

  // --- Utility Functions ---

  const getRuleBasedAnswer = useCallback((question) => {
    const categories = Object.values(ruleBasedQA).flat();
    const match = categories.find(qa => qa.question.toLowerCase().trim() === question.toLowerCase().trim());
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
  
  // --- API Call Handler (OpenRouter Chat) ---

  const sendMessage = async (text) => {
    const query = text.trim();

    // 1. Check for Rule-Based Answer first
    const ruleAnswer = getRuleBasedAnswer(query);
    if (ruleAnswer) {
      setMessages(prev => [...prev, { type: "user", text: query }]);
      setMessages(prev => [...prev, { type: "bot", text: ruleAnswer }]);
      setInputText("");
      return;
    }
    
    // 2. If no rule-based match, send to AI chat
    setMessages(prev => [...prev, { type: "user", text: query }]);
    setInputText("");
    setIsProcessing(true); 
    
    try {
      const apiPayload = {
        message: query,
        model: OPENROUTER_MODEL, 
        referer: APP_REFERER,
        title: APP_TITLE,
      };
      
      const res = await fetch(CHAT_PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload)
      });
      
      const data = await res.json();
      
      if (res.ok && data.reply) {
        setMessages(prev => [...prev, { type: "bot", text: data.reply }]);
      } else {
        const errorText = data.error || data.details || 'AI Chat returned an error or empty response.';
        setMessages(prev => [...prev, { type: "bot", text: `Error: ${errorText}. Please check the server logs.` }]);
        console.error("OpenRouter Error:", errorText);
      }

    } catch (err) {
      setMessages(prev => [...prev, { type: "bot", text: `Network Error: Could not connect to the chat service.` }]);
      console.error("Chatbot fetch error:", err);
    } finally {
      setIsProcessing(false); 
    }
  };

  // Handles Enter key press
  const handleInputSubmit = (e) => {
    if (e.key === "Enter" && inputText.trim() && !isProcessing) {
        sendMessage(inputText);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50 font-sans">
      {/* Floating Animated Robot Icon */}
      <motion.div
        className="mb-2 bg-neonBlue text-white p-3 rounded-full shadow-lg cursor-pointer flex items-center justify-center"
        style={{
            '--neon-color': NEON_BLUE, 
            backgroundColor: NEON_BLUE,
            boxShadow: `0 0 15px var(--neon-color)`
        }}
        onClick={() => setVisible(!visible)}
        animate={{ y: [0, -10, 0] }} // floating effect
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.2, boxShadow: `0 0 20px ${NEON_BLUE}` }}
        whileTap={{ scale: 0.95 }}
      >
        <Bot size={28} />
      </motion.div>

      {/* Chatbox */}
      <AnimatePresence>
        {visible && (
          <motion.div
            className="w-80 max-w-full rounded-lg flex flex-col overflow-hidden text-gray-100"
            style={{ 
              backgroundColor: DARK_BG, 
              border: `2px solid ${NEON_BLUE}`,
              boxShadow: `0 0 20px ${NEON_BLUE}`,
              minHeight: '450px'
            }}
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div 
              className={`px-4 py-3 font-extrabold text-lg flex justify-between items-center`}
              style={{ backgroundColor: NEON_BLUE, color: DARK_BG, boxShadow: `0 0 10px ${NEON_BLUE}` }}
            >
              <span>Scooby Doo Assistant</span>
              <button 
                onClick={() => setVisible(false)} 
                className="text-xl font-bold hover:text-gray-700 transition-colors"
              >
                &times;
              </button>
            </div>
            
            {/* Message Display Area */}
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar space-y-3" style={{ maxHeight: "300px" }}>
              
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.type === "user" ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                  className={`max-w-[80%] p-3 rounded-xl shadow-lg text-sm ${
                    msg.type === "user"
                      ? "bg-purple-600 text-white ml-auto rounded-br-none"
                      : "bg-gray-700 text-gray-50 mr-auto rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </motion.div>
              ))}
              
              {/* Loading/Typing Indicator */}
              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex mr-auto items-center p-3 rounded-xl text-xs"
                    style={{ backgroundColor: NEON_BLUE, color: DARK_BG, maxWidth: '150px' }}
                  >
                    <span className="animate-pulse font-semibold">
                        Assistant is typing...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={chatEndRef} />
            </div>

            {/* Input and Send Button */}
            <div className="p-3 border-t border-gray-700 flex gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleInputSubmit}
                    placeholder={isProcessing ? "Waiting for response..." : "Ask a question or enter a topic..."}
                    disabled={isProcessing}
                    className={`flex-1 px-3 py-2 rounded-full text-white outline-none transition-all duration-300 placeholder-gray-500 text-sm`}
                    style={{ 
                        backgroundColor: 'rgba(50, 50, 50, 0.5)',
                        border: `1px solid ${NEON_BLUE}`,
                        boxShadow: `0 0 5px ${NEON_BLUE}`
                    }}
                />
                <motion.button
                    onClick={() => sendMessage(inputText)}
                    disabled={!inputText.trim() || isProcessing}
                    whileHover={{ scale: (!inputText.trim() || isProcessing) ? 1 : 1.05 }}
                    whileTap={{ scale: (!inputText.trim() || isProcessing) ? 1 : 0.95 }}
                    className={`px-3 py-2 rounded-full font-semibold transition-colors duration-200 text-xs flex items-center ${
                         (!inputText.trim() || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    style={{
                        backgroundColor: NEON_BLUE,
                        color: DARK_BG,
                        boxShadow: `0 0 10px ${NEON_BLUE}`
                    }}
                >
                    <Send size={16} className="mr-1" />
                    Chat
                </motion.button>
            </div>

            {/* Categorized Questions/Suggestions */}
            <div className="p-3 border-t border-gray-700 flex flex-col gap-3">
              <div className="font-semibold" style={{ color: NEON_BLUE }}>Suggested Topics (Instant Answer):</div>
              {Object.entries(ruleBasedQA).map(([category, qas], idx) => (
                <div key={idx} className="border-t border-gray-800 pt-2 first:border-t-0 first:pt-0">
                  <div className="font-bold text-white mb-1 text-sm" style={{ color: NEON_PINK }}>{category}</div>
                  <div className="flex flex-wrap gap-2">
                    {qas.map((qa, i) => (
                      <motion.button
                        key={i}
                        onClick={() => handleQuestionClick(qa)}
                        disabled={isProcessing}
                        whileHover={{ scale: isProcessing ? 1 : 1.05 }}
                        whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                        className={`text-xs px-2 py-1 rounded-full border border-gray-600 transition-all duration-300 ${
                            isProcessing 
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50" 
                                : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        style={{ color: NEON_BLUE, boxShadow: isProcessing ? 'none' : `0 0 5px ${NEON_BLUE}` }}
                      >
                        {qa.question}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom scrollbar and theme classes */}
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
