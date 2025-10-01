import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your assistant. Ask me anything about the site." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://ecell-blog-project.onrender.com/api/chatbot/public",
        { message: input }
      );

      const botReply = res.data.answer || "No response from server.";
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `⚠️ Server/network error: ${err.response?.data?.answer || err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-lg flex flex-col border border-gray-300 z-50">
      <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg font-semibold">
        Chatbot
      </div>
      <div
        className="flex-1 p-3 overflow-y-auto space-y-2"
        style={{ maxHeight: "300px", scrollbarWidth: "thin" }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-md ${
              msg.sender === "user" ? "bg-blue-100 text-right ml-auto" : "bg-gray-100"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="flex border-t border-gray-300 p-2">
        <input
          type="text"
          className="flex-1 border rounded px-2 py-1"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
      {/* Custom scrollbar styling */}
      <style>{`
        div::-webkit-scrollbar {
          width: 6px;
        }
        div::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
