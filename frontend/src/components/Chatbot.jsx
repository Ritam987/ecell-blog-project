import React, { useState, useRef, useEffect } from "react";

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi 👋 I’m your assistant. Ask me about login, register, posting blogs, or even request me to write a blog for you!" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg, { sender: "bot", text: "🤔 Thinking..." }]);
    setInput("");

    try {
      const res = await fetch("https://ecell-blog-project.onrender.com/chatbot/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      console.log("Chatbot response:", data);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          sender: "bot",
          text: data.reply || "⚠️ No reply received",
        };
        return updated;
      });
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { sender: "bot", text: "⚠️ Server error." };
        return updated;
      });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white border border-gray-300 rounded-lg shadow-lg flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 rounded-t-lg font-bold">
        💬 Blogging Assistant
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-[75%] ${
              msg.sender === "user"
                ? "bg-blue-100 text-right ml-auto"
                : "bg-gray-100 text-left"
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
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-600 text-white px-3 py-1 rounded text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
