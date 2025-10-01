// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from "react";

const ruleBasedQA = [
  { question: "How to login?", answer: "Click on the Login button in the navbar and enter your credentials." },
  { question: "How to register?", answer: "Click on Register, fill in the details, and submit." },
  { question: "How to logout?", answer: "Click on your profile and select Logout." },
  { question: "How to create a blog?", answer: "Click on 'Create Blog' in the navbar and fill out the form." },
  { question: "How to edit my blog?", answer: "Go to your blog details page and click 'Edit' if you are the author." },
  { question: "How to delete my blog?", answer: "Go to your blog details page and click 'Delete' if you are the author." },
  { question: "How can I read the full blog?", answer: "Click on 'More' on the blog card to view the full content." },
];

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! I am your assistant. Click a question below to get guidance." },
  ]);
  const [visible, setVisible] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleQuestionClick = (qa) => {
    setMessages((prev) => [
      ...prev,
      { type: "user", text: qa.question },
      { type: "bot", text: qa.answer },
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end">
      {/* Toggle Button */}
      <button
        className="mb-2 bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
        onClick={() => setVisible(!visible)}
      >
        {visible ? "Hide Chatbot" : "Show Chatbot"}
      </button>

      {/* Chatbox */}
      {visible && (
        <div className="w-80 max-w-full bg-white border shadow-lg rounded-lg flex flex-col">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-t-lg font-bold">
            Chatbot
          </div>
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
          <div className="p-2 border-t flex flex-wrap gap-2">
            {ruleBasedQA.map((qa, idx) => (
              <button
                key={idx}
                onClick={() => handleQuestionClick(qa)}
                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
              >
                {qa.question}
              </button>
            ))}
          </div>

          {/* Custom scrollbar */}
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
      )}
    </div>
  );
};

export default Chatbot;
