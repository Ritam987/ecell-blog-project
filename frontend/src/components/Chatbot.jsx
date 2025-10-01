import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hello! I can help you navigate the blog site or answer questions." }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to the latest message automatically
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await axios.post(
        "https://ecell-blog-project.onrender.com/api/chatbot/public",
        { message: input }
      );
      setMessages((prev) => [...prev, { role: "bot", content: res.data.answer }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      // Display the exact error in the chat box
      const errorMsg =
        err.response?.data?.answer ||
        err.response?.data?.error ||
        err.message ||
        "⚠️ Server error. Please try again.";
      setMessages((prev) => [...prev, { role: "bot", content: errorMsg }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="fixed bottom-5 right-5 w-80 max-h-[500px] bg-white border rounded-lg shadow-lg flex flex-col">
      <div className="p-2 font-bold border-b">Chatbot</div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded ${
              msg.role === "user" ? "bg-blue-200 text-right self-end" : "bg-gray-200 text-left self-start"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>
      <div className="p-2 border-t flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 border rounded px-2 py-1"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
