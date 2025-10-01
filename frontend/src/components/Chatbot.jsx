import React, { useState, useRef, useEffect } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your assistant. Ask me anything about the site." }
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

    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const query = encodeURIComponent(input);
      const res = await fetch(`https://ecell-blog-project.onrender.com/api/chatbot/public?query=${query}`);
      const data = await res.json();

      const botMsg = { sender: "bot", text: data.answer || "Sorry, I could not get a response." };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot error:", err);
      const errMsg = { sender: "bot", text: `⚠️ Server/network error: ${err.message}` };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = e => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col">
      <div className="flex-1 p-2 overflow-y-auto custom-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`my-1 p-2 rounded-md ${
              msg.sender === "user" ? "bg-blue-100 self-end" : "bg-gray-100 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="p-2 border-t border-gray-200 flex">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 border border-gray-300 rounded-l px-2 py-1 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-3 py-1 rounded-r hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>

      {/* Custom scrollbar style */}
      <style>
        {`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0,0,0,0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        `}
      </style>
    </div>
  );
};

export default Chatbot;
