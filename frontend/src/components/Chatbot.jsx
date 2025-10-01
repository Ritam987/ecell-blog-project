import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "https://ecell-blog-project.onrender.com";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I can help you navigate the blog site. Ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await axios.post(`${API_URL}/api/chatbot/public`, { message: input });
      const botMsg = { role: "bot", text: res.data.answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = { role: "bot", text: "⚠️ Server error. Please try again." };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="fixed bottom-5 right-5 w-80 h-96 bg-white border rounded-lg shadow-lg flex flex-col">
      <div className="p-2 font-bold text-center border-b">Chatbot 🤖</div>
      <div className="flex-1 p-2 overflow-y-auto space-y-2 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${msg.role === "user" ? "bg-blue-100 self-end" : "bg-gray-200 self-start"}`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex border-t p-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 border rounded px-2 py-1 mr-2"
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
          Send
        </button>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(100, 100, 100, 0.5);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
