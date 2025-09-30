import React, { useState } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! I am your assistant 🤖. How can I help you?" },
  ]);
  const [input, setInput] = useState("");

  // Simple rule-based responses
  const getResponse = (msg) => {
    msg = msg.toLowerCase();
    if (msg.includes("login")) return "To login, click on the Login page from the top navbar.";
    if (msg.includes("register")) return "To register, click on the Register page and fill in the details.";
    if (msg.includes("logout")) return "To logout, click the Logout button in the Navbar after login.";
    if (msg.includes("edit blog")) return "If you are the author, you can go to the blog details page and click the Edit button.";
    if (msg.includes("delete blog")) return "Authors can delete their blog using the Delete button in the blog details or homepage.";
    if (msg.includes("read full blog")) return "Click on 'Read More' on the blog card to read the full content.";
    return "Sorry, I can only help with site navigation and blog actions for now.";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    const botMsg = { from: "bot", text: getResponse(input) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-lg border flex flex-col">
      <div className="p-2 bg-blue-600 text-white rounded-t-lg font-semibold">Site Assistant 🤖</div>
      <div className="flex-1 p-2 overflow-y-auto h-60">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.from === "bot" ? "text-left" : "text-right"}`}>
            <span
              className={`inline-block p-2 rounded-lg ${
                m.from === "bot" ? "bg-gray-200 text-black" : "bg-blue-600 text-white"
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 p-2 border-none focus:outline-none rounded-bl-lg"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 rounded-br-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
