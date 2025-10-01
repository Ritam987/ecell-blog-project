// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from "react";

const ruleBasedQA = {
  "User Actions": [
    { question: "How to login?", answer: "Click on the Login button in the navbar and enter your credentials." },
    { question: "How to register?", answer: "Click on Register, fill in the details, and submit." },
    { question: "How to logout?", answer: "Click on your profile and select Logout." },
    { question: "How to create a blog?", answer: "Click on 'Create Blog' in the navbar and fill out the form." },
    { question: "How to edit my blog?", answer: "Go to your blog details page and click 'Edit' if you are the author." },
    { question: "How to delete my blog?", answer: "Go to your blog details page and click 'Delete' if you are the author." },
    { question: "How can I read the full blog?", answer: "Click on 'More' on the blog card to view the full content." },
    { question: "How can I like a blog?", answer: "On any blog page or blog card, click the 'Like' button to like or unlike a blog." },
    { question: "How can I comment on a blog?", answer: "Go to the blog details page, type your comment in the comment box, and click 'Submit'." },
  ],
  "Admin Actions": [
    { question: "How to access admin panel?", answer: "If your account has admin rights, click on 'Admin Panel' in the navbar to manage users and blogs." },
  ],
};

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

          {/* Categorized buttons */}
          <div className="p-2 border-t flex flex-col gap-2">
            {Object.entries(ruleBasedQA).map(([category, qas], idx) => (
              <div key={idx}>
                <div className="font-semibold mb-1">{category}</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {qas.map((qa, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuestionClick(qa)}
                      className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
                    >
                      {qa.question}
                    </button>
                  ))}
                </div>
              </div>
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
