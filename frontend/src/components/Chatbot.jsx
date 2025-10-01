import React, { useState, useEffect, useRef } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your assistant. Ask me anything about the site." }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom automatically
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
    setInput("");

    try {
      const res = await fetch(`https://ecell-blog-project.onrender.com/api/chatbot/public?query=${encodeURIComponent(userMessage)}`);
      const data = await res.json();
      setMessages(prev => [...prev, { sender: "bot", text: data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: "bot", text: `⚠️ Server/network error: ${error.message}` }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "350px",
      maxHeight: "400px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      display: "flex",
      flexDirection: "column",
      background: "#fff",
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      overflow: "hidden"
    }}>
      <div style={{ padding: "10px", fontWeight: "bold", background: "#f5f5f5", textAlign: "center" }}>
        Chatbot
      </div>

      <div style={{ flex: 1, padding: "10px", overflowY: "auto", scrollbarWidth: "thin" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ margin: "5px 0", textAlign: msg.sender === "user" ? "right" : "left" }}>
            <span style={{
              display: "inline-block",
              padding: "8px 12px",
              borderRadius: "15px",
              background: msg.sender === "user" ? "#007bff" : "#eee",
              color: msg.sender === "user" ? "#fff" : "#000",
              maxWidth: "80%",
              wordWrap: "break-word"
            }}>
              {msg.text}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", borderTop: "1px solid #ccc" }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          style={{ flex: 1, padding: "10px", border: "none", outline: "none" }}
        />
        <button onClick={sendMessage} style={{ padding: "10px", background: "#007bff", color: "#fff", border: "none" }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
