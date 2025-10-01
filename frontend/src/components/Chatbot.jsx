// frontend/src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! 👋 I’m your assistant. Ask me about login, register, blogs, or even general questions!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      // Check if user is logged in
      const token = localStorage.getItem("token");
      const endpoint = token
        ? "https://ecell-blog-project.onrender.com/api/chatbot"
        : "https://ecell-blog-project.onrender.com/api/chatbot/public";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();
      const reply = data.reply || "⚠️ No response from chatbot.";

      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error connecting to chatbot. Try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-2xl rounded-lg border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-2 font-semibold">
        Assistant Chatbot 🤖
      </div>

      {/* Chat area */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-2"
        style={{ maxHeight: "300px" }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg text-sm ${
              msg.sender === "user"
                ? "bg-blue-100 self-end text-right"
                : "bg-gray-100 text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 p-2 text-sm outline-none"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white px-3 text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
