// src/components/Chatbot.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your assistant. Ask me about blog actions or anything else.", type: "bot" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, type: "user" };
    setMessages((prev) => [...prev, userMsg]);
    const query = input.trim().toLowerCase();
    setInput("");

    try {
      // RULES-BASED RESPONSES
      const rulesResponses = {
        "how to login": "Go to the login page, enter your credentials and click 'Login'.",
        "how to register": "Go to the register page, fill details, and click 'Register'.",
        "how to logout": "Click on the logout button in the navbar to log out.",
        "how to create blog": "Go to 'Create Blog' page and fill title, content, tags, and image.",
        "how to edit blog": "Open your blog, click 'Edit', modify details and save.",
        "how to delete blog": "Open your blog, click 'Delete', and confirm deletion.",
        "how to read full blog": "Click 'Read More' on any blog to view full content.",
      };

      if (rulesResponses[query]) {
        setMessages((prev) => [...prev, { text: rulesResponses[query], type: "bot" }]);
        return;
      }

      // AI RESPONSE via backend API
      const res = await axios.post(`${process.env.REACT_APP_API_URL || "https://ecell-blog-project.onrender.com"}/api/chatbot/public`, { prompt: input });
      setMessages((prev) => [...prev, { text: res.data.response, type: "bot" }]);
    } catch (err) {
      setMessages((prev) => [...prev, { text: "⚠️ Server error. Try again.", type: "bot" }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, width: 300, zIndex: 999 }}>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700"
      >
        {open ? "Close" : "Chat"}
      </button>

      {/* Chat Box */}
      {open && (
        <div className="mt-2 bg-white shadow-lg rounded-lg flex flex-col" style={{ height: 400 }}>
          <div
            className="p-3 overflow-y-auto"
            style={{ flex: 1, maxHeight: "100%", scrollbarWidth: "thin", scrollbarColor: "#888 #f1f1f1" }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 p-2 rounded ${msg.type === "bot" ? "bg-gray-200 self-start" : "bg-blue-500 text-white self-end"}`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="flex border-t p-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border rounded px-2 py-1"
            />
            <button
              onClick={handleSend}
              className="ml-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
