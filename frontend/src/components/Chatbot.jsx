import React, { useState } from "react";
import API from "../utils/api";
import { getToken } from "../utils/auth";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);
    setInput("");

    try {
      const res = await API.post(
        "/chatbot",
        { message: input },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      alert(err.response?.data?.message || "Error sending message");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-lg p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-2">Site Assistant 🤖</h2>
      <div className="flex-1 overflow-y-auto mb-2 space-y-2 h-60 border p-2 rounded">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === "user" ? "text-right" : "text-left"}>
            <span
              className={`inline-block p-2 rounded ${
                msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Ask me..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
