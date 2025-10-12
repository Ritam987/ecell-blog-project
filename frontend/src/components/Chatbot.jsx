import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Configuration for the backend API URL
// NOTE: This URL should point to your deployed Express backend.
const API_URL = "https://ecell-blog-project.onrender.com/api/chatbot";

// Hardcoded QA for initial suggestions (Rule-Based functionality is preserved)
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
    { type: "bot", text: "Hello! I am your assistant. Click a question below or ask me anything." }
  ]);
  const [visible, setVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false); // State for loading indicator
  const chatEndRef = useRef(null);

  // Scroll to bottom when new message or loading state changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // Utility function to check if the question is in the hardcoded QA
  const getRuleBasedAnswer = (question) => {
    const categories = Object.values(ruleBasedQA).flat();
    const match = categories.find(qa => qa.question.toLowerCase() === question.toLowerCase());
    return match ? match.answer : null;
  }

  // Handler to send message to the backend API
  const sendMessage = async (text) => {
    // 1. Check for rule-based answer first (for instant response on suggestion clicks)
    const ruleAnswer = getRuleBasedAnswer(text);
    if (ruleAnswer) {
      setMessages(prev => [...prev, { type: "user", text }]);
      setMessages(prev => [...prev, { type: "bot", text: ruleAnswer }]);
      setInputText("");
      return;
    }
    
    // 2. Add user message and start API processing
    setMessages(prev => [...prev, { type: "user", text }]);
    setInputText("");
    setIsProcessing(true); // Start loading

    try {
      // 3. Send request to the backend
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      
      const data = await res.json();

      // 4. Handle response from the backend
      if (res.ok && data.reply) {
        // Success: Status 2xx and 'reply' field present
        setMessages(prev => [...prev, { type: "bot", text: data.reply }]);
      } else if (data.error) {
        // Error: Non-2xx status and 'error' field present (from the fixed backend)
        const errorMessage = data.error.includes("API key is not configured")
          ? "Configuration Error: The server's API Key is missing. Check backend setup."
          : `Server Error: ${data.error}`;
          
        setMessages(prev => [...prev, { type: "bot", text: errorMessage }]);
      } else {
        // Unknown error structure
        setMessages(prev => [...prev, { type: "bot", text: "Sorry, I received an unclear response from the server. Can you rephrase?" }]);
      }
    } catch (err) {
      // Network failure (connection refused, timeout, etc.)
      setMessages(prev => [...prev, { type: "bot", text: "Error contacting the API server. Please check your network connection." }]);
      console.error("Frontend fetch error:", err);
    } finally {
      setIsProcessing(false); // Stop loading regardless of outcome
    }
  };
  
  const handleQuestionClick = (qa) => {
    // Prevent clicking while a request is pending
    if (!isProcessing) {
      sendMessage(qa.question);
    }
  };

  const handleSend = () => {
    if (inputText.trim() && !isProcessing) {
        sendMessage(inputText);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50 font-sans">
      {/* Floating Robot Button */}
      <motion.button
        className="mb-2 w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl font-bold transition-all duration-500"
        style={{
          backgroundColor: 'rgb(57, 255, 20)', // neonGreen equivalent
          boxShadow: '0 0 20px rgba(57, 255, 20, 0.7)', // neon shadow
          color: 'black'
        }}
        onClick={() => setVisible(!visible)}
        whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(57, 255, 20, 1)" }}
        animate={{ y: [0, -10, 0] }} 
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        🤖
      </motion.button>

      {/* Chatbox */}
      <AnimatePresence>
        {visible && (
          <motion.div
            className="w-80 max-w-full bg-gray-900 border border-green-400 shadow-xl rounded-lg flex flex-col overflow-hidden text-gray-100"
            style={{ 
              boxShadow: '0 0 15px rgba(57, 255, 20, 0.5)',
              minHeight: '400px'
            }}
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div 
              className="px-4 py-3 font-extrabold text-lg flex justify-between items-center text-gray-900"
              style={{ backgroundColor: 'rgb(57, 255, 20)' }}
            >
              Blog Assistant
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
                  className={`max-w-[80%] p-3 rounded-xl shadow-md ${
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
                    className="flex mr-auto items-center p-3 rounded-xl bg-gray-700 max-w-[50%]"
                  >
                    <span className="animate-pulse text-sm">Assistant is typing...</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={chatEndRef} />
            </div>

            {/* Input and Send Button */}
            <div className="p-3 border-t border-green-500 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={isProcessing ? "Waiting for response..." : "Type your question..."}
                disabled={isProcessing}
                className={`flex-1 px-3 py-2 rounded-full bg-gray-800 text-white outline-none transition-all duration-300 ${
                    isProcessing ? 'opacity-70 cursor-not-allowed' : 'focus:ring-2 focus:ring-green-400'
                }`}
              />
              <motion.button
                onClick={handleSend}
                disabled={!inputText.trim() || isProcessing}
                whileHover={{ scale: !isProcessing ? 1.05 : 1 }}
                whileTap={{ scale: !isProcessing ? 0.95 : 1 }}
                className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 ${
                    !inputText.trim() || isProcessing
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-green-500 text-gray-900 shadow-md hover:bg-green-400"
                }`}
              >
                {isProcessing ? (
                    <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    'Send'
                )}
              </motion.button>
            </div>

            {/* Categorized Questions/Suggestions */}
            <div className="p-3 border-t border-green-500 flex flex-col gap-3">
              <div className="font-semibold text-green-400 text-sm">Suggested Topics:</div>
              {Object.entries(ruleBasedQA).map(([category, qas], idx) => (
                <div key={idx} className="border-t border-gray-800 pt-2 first:border-t-0 first:pt-0">
                  <div className="font-bold text-white mb-1 text-sm">{category}</div>
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
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                                : "bg-gray-700 text-green-300 hover:bg-gray-600"
                        }`}
                      >
                        {qa.question}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Tailwind/CSS Styles (for scrollbar) */}
            <style>{`
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
