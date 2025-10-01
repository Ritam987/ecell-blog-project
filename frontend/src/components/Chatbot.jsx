import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getUser } from "../utils/auth"; // optional for rules-based logic

const rulesBasedResponses = [
  {
    question: /how to login/i,
    answer: "To login, click the login button and enter your credentials.",
  },
  {
    question: /how to register/i,
    answer: "To register, click the register button and fill in the required details.",
  },
  {
    question: /how to logout/i,
    answer: "To logout, click the logout button in the navigation bar.",
  },
  {
    question: /how to edit a blog/i,
    answer: "If you are the author, navigate to the blog and click the Edit button.",
  },
  {
    question: /how to delete a blog/i,
    answer: "If you are the author, navigate to your blog and click the Delete button.",
  },
  {
    question: /how to read full blog/i,
    answer: "Click on 'Read More' in any blog snippet to view the full content.",
  },
];

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! I am your assistant. How can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Check rules-based responses first
      const rule = rulesBasedResponses.find((r) => r.question.test(input));
      if (rule) {
        setMessages((prev) => [...prev, { from: "bot", text: rule.answer }]);
      } else {
        // AI response via public endpoint
        const res = await axios.post(
          "https://ecell-blog-project.onrender.com/api/chatbot/public",
          { message: input }
        );

        setMessages((prev) => [
          ...prev,
          { from: "bot", text: res.data.answer },
        ]);
      }
    } catch (err) {
      console.error("Chatbot error:", err.message || err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Server error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-lg flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg font-semibold">
        Chatbot Assistant
      </div>

      {/* Chat messages container */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-2"
        style={{ maxHeight: "300px", scrollbarWidth: "thin" }}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.from === "user" ? "bg-blue-100 self-end" : "bg-gray-100 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input box */}
      <div className="flex border-t p-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 border rounded px-2 py-1 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="ml-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>

      {/* Scrollbar styling */}
      <style jsx>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-thumb {
          background: #3b82f6; /* blue */
          border-radius: 3px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
