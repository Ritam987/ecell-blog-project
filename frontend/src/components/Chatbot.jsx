import React, { useState, useRef, useEffect } from "react";

function Chatbot() {
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Hi! I’m your assistant. Ask me about login, register, posting, editing, or even to write a blog!" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setInput("");

    // Show "thinking"
    setMessages((prev) => [...prev, { from: "bot", text: "🤔 Thinking..." }]);

    try {
      const res = await fetch("https://ecell-blog-project.onrender.com/chatbot/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev.slice(0, -1), // remove "Thinking..."
        { from: "bot", text: data.reply || "⚠️ No reply received." }
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { from: "bot", text: "⚠️ Error connecting to chatbot." }
      ]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg border rounded-lg flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-2 rounded-t-lg text-center font-bold">
        💬 Chatbot Assistant
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-96 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg text-sm max-w-[80%] ${
              msg.from === "user"
                ? "bg-blue-100 ml-auto text-right"
                : "bg-gray-100 mr-auto text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border rounded p-1 text-sm"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
