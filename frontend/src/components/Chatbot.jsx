import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { FaRobot } from "react-icons/fa"; 
import { Copy, Sparkles, Send } from 'lucide-react'; // Added for new features

// --- START OF CONFIGURATION (API Endpoints & Details) ---
// OpenRouter Chat Proxy (General Q&A, uses your existing backend route)
const CHAT_PROXY_URL = "/api/chatbot"; 
// Gemini Draft Generation Proxy (Requires new backend route: routes/blogDraft.ts)
const BLOG_DRAFT_URL = "/api/blog-draft-generator"; 

// Details passed to the proxy server
const OPENROUTER_MODEL = "openai/gpt-oss-20b:free"; 
const APP_REFERER = 'https://ecell-blog-project.onrender.com'; 
const APP_TITLE = "E-Cell Blog Assistant";

// Custom theme colors for React styles (matching your existing CSS intent)
const NEON_BLUE = 'rgb(57, 255, 20)'; 
const NEON_PINK = '#ff00ff';
const DARK_BG = 'rgb(10, 10, 10)'; 
// --- END OF CONFIGURATION ---

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
    { type: "bot", text: "Hello! I am Scooby Doo, your personal assistant. Click a question below, or use the input box to ask an **LLM** any other question, or generate a **blog draft**." },
  ]);
  const [visible, setVisible] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false); // For OpenRouter Chat
  const [blogDraft, setBlogDraft] = useState(null); // State for Gemini-generated draft
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false); // For Gemini Draft loading

  const chatEndRef = useRef(null);
  const draftRef = useRef(null);
  const location = useLocation();
  
  // scroll to bottom when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing, isGeneratingDraft]);

  // scroll to draft area when draft is generated
  useEffect(() => {
    if (blogDraft) {
        draftRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [blogDraft]);

  // auto-hide chatbot and reset when route changes
  useEffect(() => {
    setVisible(false);
    setMessages([{ type: "bot", text: "Hello! I am Scooby Doo, your personal assistant. Click a question below, or use the input box to ask an **LLM** any other question, or generate a **blog draft**." }]);
    setBlogDraft(null);
  }, [location.pathname]);

  // --- Utility Functions ---

  const getRuleBasedAnswer = useCallback((question) => {
    const categories = Object.values(ruleBasedQA).flat();
    const match = categories.find(qa => qa.question.toLowerCase() === question.toLowerCase());
    return match ? match.answer : null;
  }, []);

  const handleCopyToClipboard = (text) => {
    try {
      // Use document.execCommand('copy') for better iframe compatibility
      const tempTextArea = document.createElement('textarea');
      tempTextArea.value = text;
      document.body.appendChild(tempTextArea);
      tempTextArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextArea);
      setMessages(prev => [...prev, { type: "bot", text: "✅ Draft copied to clipboard!" }]);
    } catch (err) {
      setMessages(prev => [...prev, { type: "bot", text: "❌ Failed to copy draft. Please copy manually." }]);
    }
  };

  const handleQuestionClick = (qa) => {
    if (!isProcessing && !isGeneratingDraft) {
      setMessages((prev) => [
        ...prev,
        { type: "user", text: qa.question },
        { type: "bot", text: qa.answer },
      ]);
    }
  };
  
  // --- API Call Handlers ---

  // Handler for OpenRouter (General Chat)
  const sendMessage = async (text) => {
    setBlogDraft(null);
    const ruleAnswer = getRuleBasedAnswer(text);
    if (ruleAnswer) {
      setMessages(prev => [...prev, { type: "user", text }]);
      setMessages(prev => [...prev, { type: "bot", text: ruleAnswer }]);
      setInputText("");
      return;
    }
    
    setMessages(prev => [...prev, { type: "user", text }]);
    setInputText("");
    setIsProcessing(true); 
    
    try {
      const apiPayload = {
        message: text,
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
        setMessages(prev => [...prev, { type: "bot", text: `Error: ${errorText}` }]);
        console.error("OpenRouter Error:", errorText);
      }

    } catch (err) {
      setMessages(prev => [...prev, { type: "bot", text: `Network Error: Could not connect to the chat service.` }]);
      console.error("Chatbot fetch error:", err);
    } finally {
      setIsProcessing(false); 
    }
  };

  // Handler for Gemini (Draft Generation)
  const generateBlogDraft = async () => {
    if (!inputText.trim()) {
        setMessages(prev => [...prev, { type: "bot", text: "Please enter a topic to generate a blog draft." }]);
        return;
    }

    const topic = inputText.trim();
    setBlogDraft(null); 
    setIsGeneratingDraft(true);
    setInputText('');

    try {
        setMessages(prev => [...prev, { type: "user", text: `Generate a blog draft about: ${topic}` }]);
        
        const apiPayload = { topic: topic };

        const res = await fetch(BLOG_DRAFT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(apiPayload)
        });

        const data = await res.json();
        
        if (res.ok && data.draft) {
            setBlogDraft(data.draft);
            setMessages(prev => [...prev, { type: "bot", text: `Generated a draft for "${topic}". Scroll down to view.` }]);
        } else {
            const errorText = data.error || data.details || 'Draft generator returned an empty response.';
            setMessages(prev => [...prev, { type: "bot", text: `Error in Draft Generation: ${errorText}` }]);
            console.error("Gemini Draft Error:", errorText);
        }

    } catch (err) {
        setMessages(prev => [...prev, { type: "bot", text: `Network Error: Could not connect to the draft service.` }]);
        console.error("Gemini Draft fetch error:", err);
    } finally {
        setIsGeneratingDraft(false);
    }
  };


  // Handles Enter key press for the main chat
  const handleInputSubmit = (e) => {
    if (e.key === "Enter" && inputText.trim() && !isProcessing && !isGeneratingDraft) {
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
        <FaRobot size={28} />
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
                {(isProcessing || isGeneratingDraft) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex mr-auto items-center p-3 rounded-xl text-xs"
                    style={{ backgroundColor: NEON_BLUE, color: DARK_BG, maxWidth: '150px' }}
                  >
                    <span className="animate-pulse font-semibold">
                        {isGeneratingDraft ? 'Generating Draft...' : 'Assistant is typing...'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={chatEndRef} />
            </div>

            {/* Input and Send Button */}
            <div className="p-3 border-t border-gray-700 flex flex-col gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleInputSubmit}
                    placeholder={isProcessing || isGeneratingDraft ? "Waiting for response..." : "Ask or enter a blog topic..."}
                    disabled={isProcessing || isGeneratingDraft}
                    className={`flex-1 px-3 py-2 rounded-full text-white outline-none transition-all duration-300 placeholder-gray-500 text-sm`}
                    style={{ 
                        backgroundColor: 'rgba(50, 50, 50, 0.5)',
                        border: `1px solid ${NEON_PINK}`,
                        boxShadow: `0 0 5px ${NEON_PINK}`
                    }}
                />
                <div className="flex justify-end gap-2">
                    {/* Gemini Draft Generator Button */}
                    <motion.button
                        onClick={generateBlogDraft}
                        disabled={!inputText.trim() || isProcessing || isGeneratingDraft}
                        whileHover={{ scale: !isProcessing && !isGeneratingDraft ? 1.05 : 1 }}
                        whileTap={{ scale: !isProcessing && !isGeneratingDraft ? 0.95 : 1 }}
                        className={`px-3 py-2 rounded-full font-semibold transition-colors duration-200 text-xs flex items-center justify-center`}
                        style={{
                            backgroundColor: NEON_PINK,
                            color: 'white',
                            boxShadow: `0 0 10px ${NEON_PINK}`
                        }}
                    >
                        <Sparkles size={16} className="mr-1" />
                        Draft
                    </motion.button>

                    {/* OpenRouter Chat Send Button */}
                    <motion.button
                        onClick={() => sendMessage(inputText)}
                        disabled={!inputText.trim() || isProcessing || isGeneratingDraft}
                        whileHover={{ scale: !isProcessing && !isGeneratingDraft ? 1.05 : 1 }}
                        whileTap={{ scale: !isProcessing && !isGeneratingDraft ? 0.95 : 1 }}
                        className={`px-3 py-2 rounded-full font-semibold transition-colors duration-200 text-xs flex items-center`}
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
            </div>

            {/* Categorized Questions/Suggestions */}
            <div className="p-3 border-t border-gray-700 flex flex-col gap-3">
              <div className="font-semibold" style={{ color: NEON_BLUE }}>Suggested Topics:</div>
              {Object.entries(ruleBasedQA).map(([category, qas], idx) => (
                <div key={idx} className="border-t border-gray-800 pt-2 first:border-t-0 first:pt-0">
                  <div className="font-bold text-white mb-1 text-sm">{category}</div>
                  <div className="flex flex-wrap gap-2">
                    {qas.map((qa, i) => (
                      <motion.button
                        key={i}
                        onClick={() => handleQuestionClick(qa)}
                        disabled={isProcessing || isGeneratingDraft}
                        whileHover={{ scale: isProcessing || isGeneratingDraft ? 1 : 1.05 }}
                        whileTap={{ scale: isProcessing || isGeneratingDraft ? 1 : 0.98 }}
                        className={`text-xs px-2 py-1 rounded-full border border-gray-600 transition-all duration-300 ${
                            isProcessing || isGeneratingDraft 
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                                : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        style={{ color: NEON_BLUE, boxShadow: isProcessing || isGeneratingDraft ? 'none' : `0 0 5px ${NEON_BLUE}` }}
                      >
                        {qa.question}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Gemini Draft Output Area */}
            <AnimatePresence>
                {blogDraft && (
                    <motion.div 
                        ref={draftRef}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-4 border-t border-gray-700 overflow-hidden"
                        style={{ backgroundColor: 'rgba(30, 30, 30, 0.7)' }}
                    >
                        <h3 className="font-extrabold mb-2 flex items-center text-sm" style={{ color: NEON_PINK }}>
                            <Sparkles size={18} className="mr-1" /> Blog Draft
                        </h3>
                        <div className="text-xs text-gray-200 whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar p-2 rounded border" style={{ backgroundColor: DARK_BG, borderColor: NEON_PINK }}>
                            {blogDraft}
                        </div>
                        <motion.button 
                            onClick={() => handleCopyToClipboard(blogDraft)}
                            className="mt-3 text-xs flex items-center text-white px-3 py-1 rounded-full hover:opacity-80 transition-colors"
                            style={{ backgroundColor: NEON_PINK }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Copy size={14} className="mr-1" /> Copy Draft
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

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
