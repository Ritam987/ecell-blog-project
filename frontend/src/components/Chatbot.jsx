// frontend/src/components/Chatbot.jsx
import React, { useState } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    setMessages([...messages, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://my-ai-chatbot.onrender.com/chatbot/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Error: " + data.error }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Server error." }]);
    }

    setLoading(false);
  };

  return (
    <div className="chatbot fixed bottom-4 right-4 w-96 bg-white shadow-xl rounded-xl flex flex-col">
      <div className="p-3 bg-blue-600 text-white rounded-t-xl font-bold">
        AI Chatbot
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-md ${
              msg.role === "user"
                ? "bg-blue-100 text-right"
                : "bg-gray-100 text-left"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <p className="text-gray-400">Thinking...</p>}
      </div>

      <div className="p-3 flex space-x-2 border-t">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-blue-600 text-white px-4 rounded-lg"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
