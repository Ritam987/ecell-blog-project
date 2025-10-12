import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  const chatEndRef = useRef(null);

  // scroll to bottom when new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to backend
  const sendMessage = async (text) => {
    setMessages(prev => [...prev, { type: "user", text }]);
    setInputText("");

    try {
      const res = await fetch("https://ecell-blog-project.onrender.com/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();

      if (data.reply) {
        setMessages(prev => [...prev, { type: "bot", text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { type: "bot", text: "Sorry, I couldn't understand that. Can you rephrase?" }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { type: "bot", text: "Error contacting server. Try again." }]);
      console.error(err);
    }
  };

  const handleQuestionClick = (qa) => sendMessage(qa.question);

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-50">
      {/* Floating Robot Button */}
      <motion.button
        className="mb-2 w-16 h-16 rounded-full bg-neonBlue shadow-neon flex items-center justify-center"
        onClick={() => setVisible(!visible)}
        whileHover={{ scale: 1.2, boxShadow: "0 0 20px #39ff14" }}
        animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
      >
        🤖
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
            <div className="bg-neonBlue text-white px-4 py-2 font-bold rounded-t-lg">Chatbot</div>
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

            {/* Input */}
            <div className="p-2 border-t border-neonBlue flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && inputText.trim() && sendMessage(inputText)}
                placeholder="Type your question..."
                className="flex-1 px-2 py-1 rounded bg-gray-800 text-white outline-none"
              />
              <button
                onClick={() => inputText.trim() && sendMessage(inputText)}
                className="px-3 py-1 bg-neonBlue text-darkBg rounded shadow-neon"
              >
                Send
              </button>
            </div>

            {/* Categorized Questions */}
            <div className="p-2 border-t border-neonBlue flex flex-col gap-2">
              {Object.entries(ruleBasedQA).map(([category, qas], idx) => (
                <div key={idx}>
                  <div className="font-semibold text-white mb-1">{category}</div>
                  <div className="flex flex-wrap gap-2">
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
