import React, { useState, useEffect, useRef } from "react";
import API from "../utils/api";
import { getToken, getUser } from "../utils/auth";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUser = getUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  // Send message handler
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    try {
      const res = await API.post(
        "/chatbot",
        { prompt: input },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      const botMessage = { sender: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error generating response. Try again." },
      ]);
      console.error(err);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700"
        onClick={() => setOpen((prev) => !prev)}
      >
        Chat
      </button>

      {open && (
        <div className="w-80 h-96 bg-white shadow-xl rounded-lg flex flex-col mt-2">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg font-semibold">
            Chatbot Assistant
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`px-2 py-1 rounded ${
                  m.sender === "user"
                    ? "bg-blue-100 self-end"
                    : "bg-gray-200 self-start"
                }`}
              >
                {m.text}
              </div>
            ))}
            {typing && (
              <div className="px-2 py-1 rounded bg-gray-200 self-start italic text-gray-600">
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-2 border-t flex">
            <input
              type="text"
              className="flex-1 border rounded px-2 py-1"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 py-1 ml-2 rounded hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
