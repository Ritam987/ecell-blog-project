// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! I am your assistant. Ask me anything about the site." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { type: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(
        `https://ecell-blog-project.onrender.com/api/chatbot/public?query=${encodeURIComponent(input)}`,
        { method: "GET" }
      );

      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const botMessage = {
        type: "bot",
        text: data.answer || "Sorry, I could not generate a response.",
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMsg = {
        type: "bot",
        text: `⚠️ Server/network error: ${err.message}`,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 max-w-full bg-white border shadow-lg rounded-lg flex flex-col">
      <div className="bg-blue-500 text-white px-4 py-2 rounded-t-lg font-bold">Chatbot</div>
      <div
        className="flex-1 p-4 overflow-y-auto custom-scrollbar"
        style={{ maxHeight: "300px" }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 p-2 rounded ${
              msg.type === "user" ? "bg-gray-200 text-right" : "bg-gray-100 text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
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
          className="ml-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>

      {/* Custom scrollbar styling */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
